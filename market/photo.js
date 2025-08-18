const qs = (s) => document.querySelector(s);
const getParam = (name) => new URLSearchParams(location.search).get(name);

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
      'https://picsum.photos/seed/sinhung1/600/600',
      'https://picsum.photos/seed/sinhung2/600/600',
      'https://picsum.photos/seed/sinhung3/600/600',
      'https://picsum.photos/seed/sinhung4/600/600',
    ],
    hero: [
      'https://picsum.photos/seed/sinhungh1/800/800',
      'https://picsum.photos/seed/sinhungh2/800/800',
    ],
  },
};

function renderGrid(detail) {
  const title = qs('#title');
  title.textContent = `${detail.name}의 사진`;
  const grid = qs('#photoGrid');
  grid.innerHTML = '';
  const imgs = [...(detail.hero || []), ...(detail.photos || [])];
  imgs.forEach((url) => {
    const cell = document.createElement('div');
    cell.className = 'ph';
    cell.style.backgroundImage = `url('${url}')`;
    grid.appendChild(cell);
  });
}
function wireBack(id) {
  qs('.btn-back')?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = `market.html?id=${encodeURIComponent(id)}`;
  });
}
(function init() {
  const id = getParam('id') || 'sinhung';
  const detail = DEMO_MARKETS[id] || DEMO_MARKETS['sinhung'];
  renderGrid(detail);
  wireBack(detail.id);
})();