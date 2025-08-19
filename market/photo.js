const qs = (s) => document.querySelector(s);
const getParam = (name) => new URLSearchParams(location.search).get(name);

// ===== 데모 데이터 =====
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

// 가게 사진 데모 (market.js 와 동일 id 사용)
const DEMO_PLACES = {
  p1: {
    id: 'p1',
    market_id: 'sinhung',
    name: '진선보쌈',
    photos: [
      'https://picsum.photos/seed/p1a/600/600',
      'https://picsum.photos/seed/p1b/600/600',
      'https://picsum.photos/seed/p1c/600/600',
      'https://picsum.photos/seed/p1d/600/600',
    ],
    hero: [
      'https://picsum.photos/seed/p1h1/800/800',
      'https://picsum.photos/seed/p1h2/800/800',
    ],
  },
  p2: {
    id: 'p2',
    market_id: 'sinhung',
    name: '한촌설렁탕 성남점',
    photos: [
      'https://picsum.photos/seed/p2a/600/600',
      'https://picsum.photos/seed/p2b/600/600',
    ],
    hero: [
      'https://picsum.photos/seed/p2h1/800/800',
      'https://picsum.photos/seed/p2h2/800/800',
    ],
  },
  p3: {
    id: 'p3',
    market_id: 'moran',
    name: '칼국수집',
    photos: [
      'https://picsum.photos/seed/p3a/600/600',
      'https://picsum.photos/seed/p3b/600/600',
      'https://picsum.photos/seed/p3c/600/600',
    ],
    hero: [
      'https://picsum.photos/seed/p3h1/800/800',
      'https://picsum.photos/seed/p3h2/800/800',
    ],
  },
};

// ===== 컨텍스트 로드 =====
function loadPhotoContext() {
  const placeId = getParam('place');
  const marketId = getParam('market') || getParam('id') || 'sinhung';

  if (placeId && DEMO_PLACES[placeId]) {
    const place = DEMO_PLACES[placeId];
    const parent =
      DEMO_MARKETS[place.market_id] ||
      DEMO_MARKETS[marketId] ||
      DEMO_MARKETS.sinhung;
    return { mode: 'place', place, parent };
  }
  const market = DEMO_MARKETS[marketId] || DEMO_MARKETS.sinhung;
  return { mode: 'market', market };
}

// ===== 렌더 =====
function renderGrid(ctx) {
  const title = qs('#title');
  const grid = qs('#photoGrid');
  grid.innerHTML = '';

  let name, imgs;
  if (ctx.mode === 'place') {
    name = ctx.place.name;
    const photos = ctx.place.photos?.length
      ? ctx.place.photos
      : [
          `https://picsum.photos/seed/${ctx.place.id}a/600/600`,
          `https://picsum.photos/seed/${ctx.place.id}b/600/600`,
          `https://picsum.photos/seed/${ctx.place.id}c/600/600`,
          `https://picsum.photos/seed/${ctx.place.id}d/600/600`,
        ];
    const hero = ctx.place.hero?.length
      ? ctx.place.hero
      : [
          `https://picsum.photos/seed/${ctx.place.id}h1/800/800`,
          `https://picsum.photos/seed/${ctx.place.id}h2/800/800`,
        ];
    imgs = [...hero, ...photos];
  } else {
    name = ctx.market.name;
    imgs = [...(ctx.market.hero || []), ...(ctx.market.photos || [])];
  }

  title.textContent = `${name}의 사진`;

  imgs.forEach((url) => {
    const cell = document.createElement('div');
    cell.className = 'ph';
    cell.style.backgroundImage = `url('${url}')`;
    grid.appendChild(cell);
  });
}

// ===== 뒤로가기 =====
function wireBack(ctx) {
  qs('.btn-back')?.addEventListener('click', () => {
    if (history.length > 1) return history.back();

    // 히스토리 없을 때 복구 경로
    const url = new URL('market.html', location.href);
    if (ctx.mode === 'place') {
      url.searchParams.set('market', ctx.parent?.id || 'sinhung');
      url.searchParams.set('place', ctx.place.id);
    } else {
      url.searchParams.set('market', ctx.market.id);
    }
    location.href = url.toString();
  });
}

// ===== 부트스트랩 =====
(function init() {
  const ctx = loadPhotoContext();
  renderGrid(ctx);
  wireBack(ctx);
})();
