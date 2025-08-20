// ==============================
// review.js (전체 교체)
// ==============================

// DOM refs
const titleElement = document.querySelector('.page-title strong');
const starWrap = document.getElementById('stars');
const ratingInput = document.getElementById('rating');
const memo = document.getElementById('memo');
const count = document.getElementById('count');
const uploadBox = document.getElementById('uploadBox');
const inputFile = document.getElementById('file');
const thumbs = document.getElementById('thumbs');
const btnSubmit = document.getElementById('btnSubmit');

// 로그인 정보( market.js와 동일 로직 )
function getMe() {
  try {
    const raw =
      localStorage.getItem('me') ||
      localStorage.getItem('profile') ||
      localStorage.getItem('auth.user');
    if (raw) {
      const o = JSON.parse(raw);
      return {
        id: String(o.id || o.userId || o.uid || o.memberId || o.loginId || ''),
        name: (o.name || o.nickname || o.username || '').trim(),
        emoji: o.emoji || '',
      };
    }
  } catch {}
  const name =
    localStorage.getItem('myName') || localStorage.getItem('nickname') || '';
  return { id: '', name: (name || '').trim(), emoji: '' };
}

// URL 파라미터
const params = new URLSearchParams(location.search);
const reviewType = params.get('type'); // 'market' | 'place'
const reviewId = params.get('id'); // marketId | placeId
const reviewName = decodeURIComponent(params.get('name') || '리뷰');
const rid = params.get('rid'); // 편집이면 존재
const revRaw = params.get('rev'); // 가상가게 컨텍스트(있을 수 있음)

// 타이틀
if (titleElement) titleElement.textContent = reviewName;

// 상단 버튼
document
  .querySelector('.btn-back')
  ?.addEventListener('click', () => history.back());
document.querySelector('.btn-close')?.addEventListener('click', () => {
  if (window.close) window.close();
  else history.back();
});

console.log('review.js loaded');

// ------------------------------
// 편집 프리필
// ------------------------------
function safeAtob(b64) {
  try {
    return atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
  }
}
const prev = (() => {
  if (!rid || !revRaw) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(safeAtob(revRaw))));
  } catch {
    return null;
  }
})();

if (rid && prev) {
  // 별점
  const val = Number(prev.rating) || 0;
  ratingInput.value = val;
  [...starWrap.querySelectorAll('.star')].forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.value) <= val);
  });

  // 본문
  memo.value = prev.text || '';
  count.textContent = memo.value.length;

  // 기존 사진(읽기전용 미리보기)
  thumbs.innerHTML = '';
  (prev.photos || []).slice(0, 3).forEach((url, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    wrap.innerHTML = `
      <img src="${url}" alt="이전 사진">
      ${
        index === 0
          ? `<button type="button" class="add-more" aria-label="사진 추가">+</button>`
          : ''
      }
    `;
    wrap
      .querySelector('.add-more')
      ?.addEventListener('click', () => inputFile.click());
    thumbs.appendChild(wrap);
  });
  uploadBox.style.display = prev.photos && prev.photos.length ? 'none' : 'flex';
}

// ------------------------------
// 별점/칩/업로드/글자수
// ------------------------------
starWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('.star');
  if (!btn) return;
  const val = Number(btn.dataset.value);
  ratingInput.value = val;
  [...starWrap.querySelectorAll('.star')].forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.value) <= val);
  });
  syncSubmit();
});

function setupChips(root) {
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const single = root.dataset.type === 'single';
    if (single) {
      [...root.querySelectorAll('.chip')].forEach(
        (c) => (c.dataset.selected = 'false')
      );
      chip.dataset.selected = 'true';
    } else {
      chip.dataset.selected =
        chip.dataset.selected === 'true' ? 'false' : 'true';
    }
    syncSubmit();
  });
}
setupChips(document.getElementById('useType'));
setupChips(document.getElementById('waitTime'));
setupChips(document.getElementById('purposes'));

// 업로드
uploadBox.addEventListener('click', () => inputFile.click());

inputFile.addEventListener('change', () => {
  thumbs.innerHTML = '';
  const files = [...inputFile.files];
  const maxThumbs = 3;
  const remaining = Math.max(0, files.length - maxThumbs);

  files.slice(0, maxThumbs).forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    wrap.innerHTML = `
      ${
        file.type.startsWith('video')
          ? `<video src="${url}" muted></video>`
          : `<img src="${url}" alt="미디어 미리보기">`
      }
      <button type="button" class="del" aria-label="삭제">×</button>
      ${
        index === 0
          ? `<button type="button" class="add-more" aria-label="사진 추가">+</button>`
          : ''
      }
      ${
        index === maxThumbs - 1 && remaining > 0
          ? `<div class="remaining">+${remaining}</div>`
          : ''
      }
    `;

    wrap.querySelector('.del').addEventListener('click', () => {
      const updated = [...inputFile.files];
      updated.splice(files.indexOf(file), 1);
      const dt = new DataTransfer();
      updated.forEach((f) => dt.items.add(f));
      inputFile.files = dt.files;
      inputFile.dispatchEvent(new Event('change'));
    });

    wrap
      .querySelector('.add-more')
      ?.addEventListener('click', () => inputFile.click());
    thumbs.appendChild(wrap);
  });

  uploadBox.style.display = files.length > 0 ? 'none' : 'flex';
  syncSubmit();
});

// 글자수
memo.addEventListener('input', () => {
  count.textContent = memo.value.length;
  syncSubmit();
});

function syncSubmit() {
  const ready =
    Number(ratingInput.value) > 0 ||
    memo.value.trim().length > 0 ||
    inputFile.files.length > 0;
  btnSubmit.disabled = !ready;
}

// ------------------------------
// 제출
// ------------------------------
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 새로 올린 파일들을 DataURL로
  const photoPromises = [...inputFile.files].map(readFileAsDataURL);
  const photoDataUrls = await Promise.all(photoPromises);

  // 편집이면 기존 사진 유지(새 업로드 없으면)
  const photosToSave = photoDataUrls.length
    ? photoDataUrls
    : rid && prev
    ? prev.photos || []
    : [];

  // 작성자(없으면 1회 생성)
  let me = getMe();
  if (!me.id && !me.name) {
    me = {
      id: 'dev_' + Math.random().toString(36).slice(2, 10),
      name: '내리뷰',
      emoji: '🙂',
    };
    try {
      localStorage.setItem('me', JSON.stringify(me));
    } catch {}
  }

  const payload = {
    id: rid || undefined, // 있으면 업서트(수정)
    user: { id: me.id, name: me.name || '방문자', emoji: me.emoji || '🙂' },
    rating: Number(ratingInput.value) || 0,
    text: memo.value.trim(),
    photos: photosToSave,
    tags: [
      pickSingle('useType'),
      `대기시간:${pickSingle('waitTime')}`,
      ...pickMulti('purposes'),
    ].filter(Boolean),

    // 호환 필드
    authorId: me.id,
    authorName: me.name,
    nickname: me.name,
  };

  // 상세로 전달
  localStorage.setItem(
    'newReview',
    JSON.stringify({ type: reviewType, id: reviewId, payload })
  );

  // 컨텍스트 파라미터 보존해서 복귀(가상가게/비마커 가게도 이름/좌표 유지)
  const targetUrl = new URL('market.html', location.href);
  targetUrl.searchParams.set(reviewType, reviewId);
  ['px', 'market', 'lat', 'lng', 'pname'].forEach((k) => {
    const v = params.get(k);
    if (v !== null && v !== '') targetUrl.searchParams.set(k, v);
  });

  // review.html 히스토리에 남지 않게
  location.replace(targetUrl.toString());
});

// 선택된 칩 읽기
function pickSingle(id) {
  const sel = document.querySelector('#' + id + ' .chip[data-selected="true"]');
  return sel ? sel.textContent.trim() : '';
}
function pickMulti(id) {
  return [
    ...document.querySelectorAll('#' + id + ' .chip[data-selected="true"]'),
  ].map((x) => x.textContent.trim());
}
