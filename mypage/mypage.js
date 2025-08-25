// 데이터 표시 기능
(function () {
  try {
    // 온보딩 때 저장한 프로필 정보를 localStorage에서 가져옵니다.
    const profileRaw = localStorage.getItem('onboarding_profile');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const displayNameEl = document.getElementById('displayName');

      // 'nickname'(별명)이 있다면 화면에 표시합니다.
      if (profile.nickname && displayNameEl) {
        displayNameEl.textContent = profile.nickname;
      }
    }
  } catch (e) {
    console.error('프로필 정보를 불러오는 데 실패했습니다.', e);
  }
})();

// 내비게이션/액션
(function () {
  // 프로필 수정으로 이동
  const goEdit = () => {
    // 온보딩 페이지로 이동하되, '수정 모드'임을 알리는 파라미터를 추가합니다.
    location.href = '../login/onboarding.html?mode=edit';
  };

  document.getElementById('btnEditProfile')?.addEventListener('click', goEdit);
  document.getElementById('btnEditArrow')?.addEventListener('click', goEdit);

  // 포인트 내역
  document.getElementById('btnHistory')?.addEventListener('click', () => {
    // TODO: 실제 적립내역 페이지 경로로 교체
    location.href = './points-history.html';
  });

  // 상품권 교환
  document.getElementById('btnCoupon')?.addEventListener('click', () => {
    alert('상품권 교환은 곧 연동된다. Hold tight, bro.');
  });
})();
document.getElementById('btnHistory')?.addEventListener('click', () => {
  location.href = './point.html'; // 같은 폴더에 point.html
});
// === 리뷰→상품권 CTA 오토링크 (mypage) ===
(() => {
  const TARGET_TEXT = '리뷰 작성하고 상품권으로 교환해요!';
  const TARGET_URL = './reward.html';

  function wire(el) {
    if (!el || el.dataset.ctaWired) return;
    el.dataset.ctaWired = '1';

    // 이미 <a>면 href만 보장
    if (el.tagName?.toLowerCase() === 'a') {
      if (!el.getAttribute('href') || el.getAttribute('href') === '#') {
        el.setAttribute('href', TARGET_URL);
      }
      return;
    }

    // 일반 박스를 링크처럼 동작
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'link');
    el.tabIndex = 0;

    const go = () => (location.href = TARGET_URL);
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  }

  function findAndWire() {
    // promo-box가 있으면 그걸 최우선으로, 없으면 텍스트 검색
    const promo = document.querySelector('.promo-box');
    if (promo && promo.textContent?.includes(TARGET_TEXT)) {
      wire(promo);
      return;
    }
    const nodes = document.querySelectorAll('main *:not(script):not(style)');
    for (const el of nodes) {
      const txt = (el.textContent || '').trim();
      if (txt.includes(TARGET_TEXT)) {
        const box = el.closest('.promo-box, a, section, div') || el;
        wire(box);
        break;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', findAndWire);
  } else {
    findAndWire();
  }
  new MutationObserver(findAndWire).observe(document, {
    childList: true,
    subtree: true,
  });
})();
const SAVED_KEY = 'saved.items';

function getSavedCount() {
  try {
    const arr = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    return Array.isArray(arr) ? arr.length : 0; // 시장 + 가게 합산
  } catch {
    return 0;
  }
}

function applySavedCount() {
  const el = document.getElementById('countSaved');
  if (el) el.textContent = String(getSavedCount());
}

// 초기/복귀/교차탭 변경 시 반영
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applySavedCount);
} else {
  applySavedCount();
}
window.addEventListener('pageshow', applySavedCount);
window.addEventListener('storage', (e) => {
  if (e.key === SAVED_KEY) applySavedCount();
});
// === MyPage 카운터: 내가 쓴 리뷰 수 / 저장 수 ===
(function () {
  const reviewEl = document.getElementById('countReview');
  const blogEl = document.getElementById('countBlog'); // 선택: 블로그 리뷰 = 동일 집계로 표시하려면 사용
  const savedEl = document.getElementById('countSaved'); // 선택: 저장된 맛집 수

  function getMe() {
    try {
      const raw =
        localStorage.getItem('me') ||
        localStorage.getItem('profile') ||
        localStorage.getItem('auth.user');
      if (raw) {
        const o = JSON.parse(raw);
        return {
          id: String(
            o.id || o.userId || o.uid || o.memberId || o.loginId || ''
          ),
          name: (o.name || o.nickname || o.username || '').trim(),
        };
      }
    } catch {}
    const name =
      localStorage.getItem('myName') || localStorage.getItem('nickname') || '';
    return { id: '', name: (name || '').trim() };
  }
  const norm = (s) => (s || '').toString().trim().toLowerCase();

  function isMine(r, me) {
    if (!r) return false;
    const ids = [
      r.user?.id,
      r.userId,
      r.uid,
      r.memberId,
      r.authorId,
      r.author?.id,
      r.writerId,
    ]
      .filter(Boolean)
      .map(String);
    const names = [
      r.user?.name,
      r.author?.name,
      r.nickname,
      r.name,
      r.writer,
      r.authorName,
    ]
      .filter(Boolean)
      .map(norm);

    if (me.id && ids.some((id) => String(id) === String(me.id))) return true;
    if (me.name && names.some((n) => n === norm(me.name))) return true;
    return false;
  }

  function countMyReviews() {
    const me = getMe();
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('reviews:')) continue;
      try {
        const arr = JSON.parse(localStorage.getItem(k)) || [];
        n += arr.filter((r) => isMine(r, me)).length;
      } catch {}
    }
    return n;
  }

  function countSaved() {
    try {
      const list = JSON.parse(localStorage.getItem('saved.items')) || [];
      return Array.isArray(list) ? list.length : 0; // place+market 모두 집계
    } catch {
      return 0;
    }
  }

  const myReviews = countMyReviews();
  if (reviewEl) reviewEl.textContent = String(myReviews);
  if (blogEl) blogEl.textContent = String(myReviews); // 필요 없으면 이 줄 제거
  if (savedEl) savedEl.textContent = String(countSaved());
})();
