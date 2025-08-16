// 간단한 데이터 훅(연동 전). research.html에서 ?id= 로 진입한다고 가정.
const DEMO_MARKETS = {
  sinhung: {
    id: 'sinhung',
    name: '신흥시장',
    area: '성남',
    type: '전통시장',
    rating: 4.5,
    ratingCount: 8,
    addr: '경기도 성남시 수정구 희망로 343번길 9',
    dist: '현재 위치에서 600m',
    phone: '031-753-8989',
    hours: '월~일 09:00 ~ 20:00',
    notes: '차량 이용시 근처 공영주차장 이용 가능 / 온누리상품권 사용 가능',
    photos: [
      'https://picsum.photos/seed/sinhung1/600/400',
      'https://picsum.photos/seed/sinhung2/600/400',
      'https://picsum.photos/seed/sinhung3/600/400',
      'https://picsum.photos/seed/sinhung4/600/400',
    ],
    hero: [
      'https://picsum.photos/seed/sinhungh1/800/500',
      'https://picsum.photos/seed/sinhungh2/800/500',
    ],
  },
};

function qs(s) {
  return document.querySelector(s);
}
function qsa(s) {
  return [...document.querySelectorAll(s)];
}
function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

async function loadMarketDetail(id) {
  // 실제 연동 시: return fetch(`/api/markets/${id}`).then(r=>r.json());
  return DEMO_MARKETS[id] || null;
}

function render(detail) {
  if (!detail) return;

  // 헤더/제목
  qs('#title').textContent = detail.name;
  const nameEl = qs('#name');
  nameEl.textContent = detail.name;
  nameEl.dataset.marketId = detail.id;

  // 카테고리
  qs('#chip-area').textContent = detail.area;
  qs('#chip-type').textContent = detail.type;

  // 평점
  qs('#rating').textContent = detail.rating.toFixed(1);
  qs('#rcount').textContent = `(${detail.ratingCount}명)`;
  const stars = qs('#stars');
  stars.style.setProperty('--rate', detail.rating);

  // 히어로 이미지
  if (detail.hero?.[0])
    qs('#hero1').style.backgroundImage = `url('${detail.hero[0]}')`;
  if (detail.hero?.[1])
    qs('#hero2').style.backgroundImage = `url('${detail.hero[1]}')`;

  // 썸네일들
  ['#p1', '#p2', '#p3', '#p4'].forEach((sel, i) => {
    const el = qs(sel);
    if (detail.photos?.[i])
      el.style.backgroundImage = `url('${detail.photos[i]}')`;
  });

  // 정보
  qs('#addr').textContent = detail.addr;
  qs('#dist').textContent = detail.dist;
  qs('#phone').textContent = detail.phone;
  qs('#hours').textContent = detail.hours;
  qs('#notes').textContent = detail.notes;
}

/* 액션 버튼 핸들러 (연동 포인트) */
function wireActions(detail) {
  qsa('.quick-actions .qa').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      // 실제 연동 시 여기서 API 호출/라우팅
      console.log(`[action] ${act}`, detail?.id);
      if (act === 'share') {
        navigator.clipboard?.writeText(location.href);
        alert('링크가 복사되었습니다.');
      }
    });
  });

  qs('.btn-back').addEventListener('click', () => history.back());
  qs('#btnMap').addEventListener('click', () => alert('지도 이동 (연동 예정)'));
  qs('#morePhotos').addEventListener('click', () =>
    alert('사진 더보기 (연동 예정)')
  );
  qs('#moreFoods').addEventListener('click', () =>
    alert('음식 랭킹 (연동 예정)')
  );
}

/* 부트스트랩 */
(async function init() {
  const id = getParam('id') || 'sinhung';
  const detail = await loadMarketDetail(id);
  render(detail);
  wireActions(detail);
})();
