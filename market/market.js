// ==============================
// market.js - 방문자 리뷰/사진/정렬/모달 구현
// ==============================

// ------------------------------
// 데모 데이터
// ------------------------------
const DEMO_MARKETS = {
  sinhung: {
    id: 'sinhung',
    name: '신흥시장',
    area: '성남',
    type: '전통시장',
    rating: 4.5,
    lat: 37.4419,
    lng: 127.1295,
    ratingCount: 8,
    addr: '경기도 성남시 수정구 희망로 343번길 9',
    dist: '현재 위치에서 600m',
    phone: '031-753-8989',
    hours: '월~일 09:00 ~ 20:00',
    notes: '차량 이용시 근처 공영주차장 이용 가능 / 온누리상품권 사용 가능',
    photos: [
      /* 생략 */
    ],
    hero: [
      /* 생략 */
    ],
  },
  moran: {
    id: 'moran',
    name: '모란시장',
    area: '성남',
    type: '전통시장',
    lat: 37.4328,
    lng: 127.129,
    rating: 4.4,
    ratingCount: 12,
    addr: '경기도 성남시 중원구 성남대로1147',
    dist: '',
    phone: '031-000-0000',
    hours: '매일 09:00 ~ 21:00',
    notes: '유명 5일장',
    photos: [],
    hero: [],
  },
  geumgwang: {
    id: 'geumgwang',
    name: '금광시장',
    area: '성남',
    type: '전통시장',
    lat: 37.449601,
    lng: 127.159294,
    rating: 4.3,
    ratingCount: 9,
    addr: '경기도 성남시 중원구 금광동',
    dist: '',
    phone: '031-000-0001',
    hours: '매일 09:30 ~ 20:30',
    notes: '',
    photos: [],
    hero: [],
  },
};
function haversine(a, b) {
  const R = 6371000,
    toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat),
    lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function findNearestMarket(lat, lng) {
  const list = Object.values(DEMO_MARKETS);
  return list.reduce((best, m) => {
    const d = haversine({ lat, lng }, { lat: m.lat, lng: m.lng });
    if (!best || d < best._d) return { ...m, _d: d };
    return best;
  }, null);
}
// 가게 데모
const DEMO_PLACES = {
  p1: {
    id: 'p1',
    market_id: 'sinhung',
    name: '진선보쌈',
    lat: 37.4426,
    lng: 127.1303,
    rating: 4.5,
    ratingCount: 31,
    addr: '신흥시장 내 A동 12호',
    phone: '010-0000-0001',
    hours: '매일 11:00 ~ 21:00',
    notes: '포장 가능 • 재방문 많음',
    photos: [
      'https://picsum.photos/seed/p1a/600/400',
      'https://picsum.photos/seed/p1b/600/400',
      'https://picsum.photos/seed/p1c/600/400',
      'https://picsum.photos/seed/p1d/600/400',
    ],
    hero: [
      'https://picsum.photos/seed/p1h1/800/500',
      'https://picsum.photos/seed/p1h2/800/500',
    ],
  },
  p2: {
    id: 'p2',
    market_id: 'sinhung',
    name: '한촌설렁탕 성남점',
    lat: 37.4413,
    lng: 127.1269,
    rating: 4.2,
    ratingCount: 18,
    addr: '신흥시장 입구 맞은편',
    phone: '010-0000-0002',
    hours: '매일 10:00 ~ 22:00',
    notes: '단체석 있음',
    photos: [
      'https://picsum.photos/seed/p2a/600/400',
      'https://picsum.photos/seed/p2b/600/400',
    ],
    hero: [
      'https://picsum.photos/seed/p2h1/800/500',
      'https://picsum.photos/seed/p2h2/800/500',
    ],
  },
  p3: {
    id: 'p3',
    market_id: 'moran',
    name: '칼국수집',
    lat: 37.4335,
    lng: 127.1276,
    rating: 4.6,
    ratingCount: 42,
    addr: '모란시장 먹자골목',
    phone: '010-0000-0003',
    hours: '화~일 10:30 ~ 20:30 (월 휴무)',
    notes: '면 추가 무료 시간 있음',
    photos: [
      'https://picsum.photos/seed/p3a/600/400',
      'https://picsum.photos/seed/p3b/600/400',
      'https://picsum.photos/seed/p3c/600/400',
    ],
    hero: [
      'https://picsum.photos/seed/p3h1/800/500',
      'https://picsum.photos/seed/p3h2/800/500',
    ],
  },
};

// 방문자 리뷰 데모
const DEMO_REVIEWS_DB = {
  market: {
    // 시장별 초기 리뷰 (없으면 [])
    sinhung: [
      {
        id: 'r_m1',
        user: { name: '시장탐방러', emoji: '🧑‍🍳' },
        rating: 4.8,
        createdAt: '2025-05-10',
        helpful: 11,
        text: '시장 분위기 굿. 먹거리 다양.',
        photos: ['https://picsum.photos/seed/m_s1/640/480'],
      },
    ],
    // 필요시 다른 시장 키 추가
  },
  place: {
    // 가게별 초기 리뷰
    p1: [
      {
        id: 'r_p1_1',
        user: { name: '양풍군2', emoji: '😀' },
        rating: 4.5,
        createdAt: '2025-04-23',
        helpful: 21,
        text: '진선보쌈 고기 촉촉. 가성비 괜찮다.',
        photos: ['https://picsum.photos/seed/rv1a/640/480'],
      },
    ],
    p2: [
      {
        id: 'r_p2_1',
        user: { name: '먹로드', emoji: '🍜' },
        rating: 4.2,
        createdAt: '2025-06-02',
        helpful: 5,
        text: '설렁탕 진함. 반찬도 깔끔.',
        photos: [],
      },
    ],
    p3: [
      {
        id: 'r_p3_1',
        user: { name: '달려라만쥬', emoji: '🥟' },
        rating: 4.6,
        createdAt: '2025-08-03',
        helpful: 7,
        text: '칼국수 국물 시원. 주말 웨이팅 주의.',
        photos: ['https://picsum.photos/seed/p3r/640/480'],
      },
    ],
  },
};
function mountStars(el) {
  if (!el) return;
  el.innerHTML = `
    <div class="row stars-bg">${starsRowHtml()}</div>
    <div class="row stars-fill">${starsRowHtml()}</div>
  `;
}

// ------------------------------
// 유틸
// ------------------------------
function resolveMarketForPlace(p, parentFromCtx) {
  // 1) 컨텍스트(parent) 우선
  if (parentFromCtx?.id && DEMO_MARKETS[parentFromCtx.id]) return parentFromCtx;

  // 2) place.market_id
  if (p?.market_id && DEMO_MARKETS[p.market_id])
    return DEMO_MARKETS[p.market_id];

  // 3) URL ?market
  const mid = getParam('market');
  if (mid && DEMO_MARKETS[mid]) return DEMO_MARKETS[mid];

  // 4) 좌표가 있으면 가장 가까운 시장
  if (typeof p?.lat === 'number' && typeof p?.lng === 'number') {
    let best = null;
    Object.values(DEMO_MARKETS).forEach((m) => {
      const d = Math.hypot(p.lat - m.lat, p.lng - m.lng); // 간단 근사치면 충분
      if (!best || d < best.d) best = { ...m, d };
    });
    if (best) return best;
  }

  // 5) 기본값
  return DEMO_MARKETS.sinhung;
}

const REV_KEY = (type, id) => `reviews:${type}:${id}`; // type = 'market' | 'place'

function loadReviewsFor(type, id) {
  const key = REV_KEY(type, id);
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : DEMO_REVIEWS_DB[type]?.[id] || [];
    // 최신/추천 정렬은 렌더에서 하므로 여기선 원본만 반환
    return Array.isArray(arr) ? arr : [];
  } catch {
    return DEMO_REVIEWS_DB[type]?.[id] || [];
  }
}

function saveReviewsFor(type, id, list) {
  try {
    localStorage.setItem(REV_KEY(type, id), JSON.stringify(list || []));
  } catch {}
}

function appendReview(type, id, review) {
  const list = loadReviewsFor(type, id);
  const rid = 'r_' + Math.random().toString(36).slice(2, 9);
  const now = new Date();
  const payload = {
    id: rid,
    user: {
      name: review?.user?.name || '방문자',
      emoji: review?.user?.emoji || '🙂',
    },
    rating: Number(review?.rating) || 0,
    createdAt: review?.createdAt || now.toISOString().slice(0, 10),
    helpful: Number(review?.helpful) || 0,
    text: review?.text || '',
    photos: Array.isArray(review?.photos) ? review.photos : [],
    // 태그 정보 추가
    tags: review?.tags || [],
  };
  list.unshift(payload); // 최신이 위로
  saveReviewsFor(type, id, list);
  return list;
}
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const getParam = (name) => new URLSearchParams(location.search).get(name);
function unpack(b64) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}
// helper: URL-safe base64 decode
function unpack(b64) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}

async function loadDetailFromParams() {
  let marketId = getParam('market') || 'sinhung';
  let placeId = getParam('place');

  // 구(id) 호환
  const idParam = getParam('id');
  if (!placeId && !getParam('market') && idParam) {
    if (DEMO_PLACES[idParam]) placeId = idParam;
    else if (DEMO_MARKETS[idParam]) marketId = idParam;
  }

  // 1) 정식 placeId가 데모에 있으면 그대로
  if (placeId && DEMO_PLACES[placeId]) {
    const place = DEMO_PLACES[placeId];
    const parent =
      DEMO_MARKETS[place.market_id] ||
      DEMO_MARKETS[marketId] ||
      DEMO_MARKETS.sinhung;
    return {
      mode: 'place',
      place,
      parent,
      scope: { type: 'place', id: place.id },
    };
  }

  // 2) placeId는 있는데(foods에서 옴) 로컬 데모엔 없음 → px로 '가상 가게' 생성
  if (placeId) {
    const extra = unpack(getParam('px')) || {};
    const parent = DEMO_MARKETS[marketId] || DEMO_MARKETS.sinhung;

    const plat = Number(getParam('lat')); // 혹시 쿼리로 따로 보낸 경우 대비
    const plng = Number(getParam('lng'));

    const virtual = {
      id: placeId, // 전달된 placeId 그대로 사용(리뷰 키 분리)
      market_id: parent.id,
      name: extra.name || getParam('pname') || '가게',
      lat: !Number.isNaN(plat)
        ? plat
        : typeof extra.lat === 'number'
        ? extra.lat
        : parent.lat,
      lng: !Number.isNaN(plng)
        ? plng
        : typeof extra.lng === 'number'
        ? extra.lng
        : parent.lng,
      rating: typeof extra.rating === 'number' ? extra.rating : 0,
      ratingCount:
        typeof extra.ratingCount === 'number' ? extra.ratingCount : 0,
      addr: extra.addr || parent.addr || '',
      phone: '',
      hours: extra.hours || '',
      notes: `소속 시장: ${parent.name}`,
      photos: Array.isArray(extra.photos) ? extra.photos : [],
      hero: [],
    };
    return {
      mode: 'place',
      place: virtual,
      parent,
      scope: { type: 'place', id: virtual.id },
    };
  }

  // 3) 홈/다른 페이지에서 pname+lat/lng만 넘어온 경우(기존 처리 유지)
  const pname = getParam('pname');
  const plat = Number(getParam('lat'));
  const plng = Number(getParam('lng'));
  if (pname && !Number.isNaN(plat) && !Number.isNaN(plng)) {
    const parent = DEMO_MARKETS[marketId] || DEMO_MARKETS.sinhung;
    const virtual = {
      id:
        'v_' +
        btoa(unescape(encodeURIComponent(pname)))
          .replace(/=+$/, '')
          .slice(0, 10),
      market_id: parent.id,
      name: pname,
      lat: plat,
      lng: plng,
      rating: 0,
      ratingCount: 0,
      addr: parent.addr || '',
      phone: '',
      hours: '',
      notes: `소속 시장: ${parent.name}`,
      photos: [],
      hero: [],
    };
    return {
      mode: 'place',
      place: virtual,
      parent,
      scope: { type: 'place', id: virtual.id },
    };
  }

  // 4) 기본: 시장 상세
  const market = DEMO_MARKETS[marketId] || DEMO_MARKETS.sinhung;
  return { mode: 'market', market, scope: { type: 'market', id: market.id } };
}

async function loadMarketReviews(/* marketId */) {
  return DEMO_REVIEWS.slice().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}
// 🔧 Kakao Map deeplink helper
function openKakaoMap({ name, lat, lng, level = 3, mode = 'map' }) {
  const base = 'https://map.kakao.com/link';
  const url =
    mode === 'to'
      ? `${base}/to/${encodeURIComponent(name)},${lat},${lng}` // 길찾기
      : `${base}/map/${encodeURIComponent(name)},${lat},${lng},${level}`; // 지도보기(줌)
  window.open(url, '_blank', 'noopener');
}

// 별 SVG 묶음
const StarSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15"><path d="M7.9996 12.5662L4.12169 14.8593C3.95037 14.9664 3.77127 15.0122 3.58439 14.9969C3.3975 14.9816 3.23397 14.9205 3.09381 14.8135C2.95364 14.7065 2.84462 14.5729 2.76675 14.4126C2.68888 14.2524 2.67331 14.0727 2.72003 13.8733L3.74791 9.53933L0.313855 6.62708C0.158115 6.4895 0.0609338 6.33265 0.0223104 6.15654C-0.016313 5.98043 -0.0047883 5.8086 0.0568846 5.64105C0.118557 5.4735 0.212001 5.33591 0.337216 5.22829C0.46243 5.12066 0.633744 5.05187 0.851156 5.02191L5.38318 4.63208L7.13525 0.550346C7.21312 0.366898 7.33397 0.229311 7.49781 0.137586C7.66165 0.045862 7.82891 0 7.9996 0C8.17029 0 8.33756 0.045862 8.50139 0.137586C8.66523 0.229311 8.78609 0.366898 8.86396 0.550346L10.616 4.63208L15.148 5.02191C15.3661 5.05248 15.5374 5.12128 15.662 5.22829C15.7866 5.3353 15.88 5.47289 15.9423 5.64105C16.0046 5.80921 16.0164 5.98135 15.9778 6.15746C15.9392 6.33357 15.8417 6.49011 15.6853 6.62708L12.2513 9.53933L13.2792 13.8733C13.3259 14.072 13.3103 14.2518 13.2325 14.4126C13.1546 14.5735 13.0456 14.7071 12.9054 14.8135C12.7652 14.9199 12.6017 14.981 12.4148 14.9969C12.2279 15.0128 12.0488 14.967 11.8775 14.8593L7.9996 12.5662Z"/></svg>
`;
function starsRowHtml() {
  return Array.from({ length: 5 }, () => StarSVG).join('');
}
function starsHtml(rate, small = false) {
  const cls = small ? 'stars sm' : 'stars';
  return `
    <div class="${cls}" style="--rate:${rate}">
      <div class="row stars-bg">${starsRowHtml()}</div>
      <div class="row stars-fill">${starsRowHtml()}</div>
    </div>
  `;
}

// 날짜 포맷
function formatStamp(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${dd}`;
}
function formatKrShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// ------------------------------
// 기본 상세 렌더
// ------------------------------
function renderMarket(m) {
  qs('#title').textContent = m.name;
  const nameEl = qs('#name');
  nameEl.textContent = m.name;
  nameEl.dataset.marketId = m.id;

  qs('#chip-area').textContent = m.area;
  qs('#chip-type').textContent = m.type;
  mountStars(qs('#stars'));
  qs('#stars').style.setProperty('--rate', m.rating);

  qs('#rating').textContent = m.rating.toFixed(1);
  qs('#rcount').textContent = `(${m.ratingCount}명)`;
  qs('#stars').style.setProperty('--rate', m.rating);

  qs('#photoTitle').textContent = `${m.name} 사진`;
  qs('#moreFoods').textContent = `${m.name} 음식 랭킹 더보기`;

  if (m.hero?.[0]) qs('#hero1').style.backgroundImage = `url('${m.hero[0]}')`;
  if (m.hero?.[1]) qs('#hero2').style.backgroundImage = `url('${m.hero[1]}')`;
  ['#p1', '#p2', '#p3', '#p4'].forEach((sel, i) => {
    const el = qs(sel);
    if (m.photos?.[i]) el.style.backgroundImage = `url('${m.photos[i]}')`;
  });

  qs('#addr').textContent = m.addr || '-';
  qs('#dist').textContent = m.dist || '';
  qs('#phone').textContent = m.phone || '-';
  qs('#hours').textContent = m.hours || '-';
  qs('#notes').textContent = m.notes || '';
  const mf = qs('#moreFoods');
  mf.textContent = `${m.name} 음식 랭킹 더보기`;
  mf.dataset.marketId = m.id;
}

function renderPlace(p, parent) {
  // 헤더: 가게 이름 + (시장명)
  qs('#title').textContent = p.name;
  const nameEl = qs('#name');

  // 소속 시장 해석 (market_id/URL/fallback)
  const parentMarket = resolveMarketForPlace(p, parent);

  nameEl.textContent = p.name;
  // ❗ 이름 엘리먼트에도 소속 시장 id를 확실히 심음 (더보기/이동에 사용)
  nameEl.dataset.marketId = parentMarket.id;

  // 칩: 지역=부모, 타입=가게
  qs('#chip-area').textContent = parentMarket.area || '성남';
  qs('#chip-type').textContent = '가게';
  mountStars(qs('#stars'));
  qs('#stars').style.setProperty('--rate', p.rating || 0);

  // 평점
  qs('#rating').textContent = (p.rating || 0).toFixed(1);
  qs('#rcount').textContent = `(${p.ratingCount || 0}명)`;
  qs('#stars').style.setProperty('--rate', p.rating || 0);

  // 사진 타이틀
  qs('#photoTitle').textContent = `${p.name} 사진`;

  // ❗ “맛집 랭킹 더보기”는 항상 ‘소속 시장’ 기준으로
  const mf = qs('#moreFoods');
  mf.textContent = `${parentMarket.name} 음식 랭킹 더보기`;
  mf.dataset.marketId = parentMarket.id;

  // 히어로/갤러리
  const h1 = p.hero?.[0] || `https://picsum.photos/seed/${p.id}h1/800/500`;
  const h2 = p.hero?.[1] || `https://picsum.photos/seed/${p.id}h2/800/500`;
  qs('#hero1').style.backgroundImage = `url('${h1}')`;
  qs('#hero2').style.backgroundImage = `url('${h2}')`;

  const photos = p.photos?.length
    ? p.photos
    : [
        `https://picsum.photos/seed/${p.id}a/600/400`,
        `https://picsum.photos/seed/${p.id}b/600/400`,
        `https://picsum.photos/seed/${p.id}c/600/400`,
        `https://picsum.photos/seed/${p.id}d/600/400`,
      ];
  ['#p1', '#p2', '#p3', '#p4'].forEach((sel, i) => {
    const el = qs(sel);
    if (photos[i]) el.style.backgroundImage = `url('${photos[i]}')`;
  });

  // 정보
  qs('#addr').textContent = p.addr || parentMarket?.addr || '-';
  qs('#dist').textContent =
    getParam('lat') && getParam('lng')
      ? '지도로 보기 가능'
      : parentMarket?.dist || '';
  qs('#phone').textContent = p.phone || '-';
  qs('#hours').textContent = p.hours || '-';
  qs('#notes').textContent = `${p.notes || ''}${
    parentMarket ? ` / 소속 시장: ${parentMarket.name}` : ''
  }`;

  // ⛔️ 아래 4줄(근접 시장으로 덮어쓰기) 제거하세요
  // const near = findNearestMarket(p.lat, p.lng) || parent;
  // const mf = qs('#moreFoods');
  // mf.textContent = `${near.name} 음식 랭킹 더보기`;
  // mf.dataset.marketId = near.id;
}

// ------------------------------
// 방문자 리뷰 영역
// ------------------------------
let REVIEWS_RAW = [];
let currentSort = 'recommended';

// 평균/개수/헤더 세팅
function renderReviewHeader(reviews) {
  const arrowSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.21857 6L7.98631e-09 0.999884L1.04357 4.32946e-07L6.78392 5.50006C6.92228 5.63267 7 5.8125 7 6C7 6.18751 6.92228 6.36734 6.78392 6.49994L1.04356 12L-8.66262e-07 11.0001L5.21857 6Z" fill="black"/>
    </svg>`;

  if (!reviews?.length) {
    qs('#stars2').style.setProperty('--rate', 0);
    qs('#r2').textContent = '0.0';
    qs('#r2c').innerHTML = `리뷰 0개 ${arrowSvg}`;
    qs('#r2c').style.cursor = 'pointer';
    qs('#r2c').setAttribute('title', '모든 방문자 사진 보기');
    return;
  }

  const avg =
    reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
    reviews.length;

  qs('#stars2').innerHTML = `
    <div class="row stars-bg">${starsRowHtml()}</div>
    <div class="row stars-fill">${starsRowHtml()}</div>
  `;
  qs('#stars2').style.setProperty('--rate', avg);
  qs('#r2').textContent = avg.toFixed(1);

  qs('#r2c').innerHTML = `리뷰 ${reviews.length}개 ${arrowSvg}`;
  qs('#r2c').style.cursor = 'pointer';
  qs('#r2c').setAttribute('title', '모든 방문자 사진 보기');
}

// 상단 사진 릴(최신 업로드 순)
function renderUgcReel(reviews) {
  const reel = qs('#ugcReel');
  reel.innerHTML = '';

  const flat = [];
  reviews.forEach((r) =>
    (r.photos || []).forEach((url) =>
      flat.push({ url, createdAt: r.createdAt, reviewId: r.id })
    )
  );
  flat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  flat.slice(0, 15).forEach((p) => {
    const item = document.createElement('div');
    item.className = 'reel-item';
    item.innerHTML = `
      <div class="ph" style="background-image:url('${p.url}')"></div>
      <div class="cap">${formatStamp(p.createdAt)}</div>
    `;
    item.addEventListener('click', () =>
      openPhotoModal(flat.map((f) => f.url))
    );
    reel.appendChild(item);
  });
}

// 리뷰 카드 정렬
function sortReviews(list, sortKey) {
  const arr = list.slice();
  switch (sortKey) {
    case 'new':
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'high':
      return arr.sort(
        (a, b) =>
          b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt)
      );
    case 'low':
      return arr.sort(
        (a, b) =>
          a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt)
      );
    case 'recommended':
    default: {
      return arr
        .map((r) => {
          const days =
            (Date.now() - new Date(r.createdAt).getTime()) / 86400000;
          const recency = Math.max(0, 20 - days);
          return {
            ...r,
            _score: (r.helpful || 0) + (r.rating || 0) * 2 + recency * 0.3,
          };
        })
        .sort((a, b) => b._score - a._score);
    }
  }
}

// 리뷰 카드 렌더
function renderReviews(list, sortKey = currentSort) {
  const area = qs('#reviewsList');
  area.innerHTML = '';

  const sorted = sortReviews(list, sortKey);

  sorted.forEach((r) => {
    const art = document.createElement('article');
    art.className = 'review';

    const head = document.createElement('div');
    head.className = 'head';
    head.innerHTML = `
      <div class="avatar">${r.user?.emoji || '🙂'}</div>
      <div class="meta"><b>${r.user?.name || '방문자'}</b></div>
      <span class="date">${formatKrShort(r.createdAt)}</span>
    `;

    const photos = r.photos || [];
    if (photos.length) {
      const picsWrap = document.createElement('div');
      picsWrap.className = 'pics4';
      const maxShow = 4;

      photos.slice(0, maxShow).forEach((url, idx) => {
        const cell = document.createElement('div');
        cell.className = 'ph';
        cell.style.backgroundImage = `url('${url}')`;

        if (idx === maxShow - 1 && photos.length > maxShow) {
          const moreCnt = photos.length - maxShow;
          cell.classList.add('more');
          cell.dataset.more = `+${moreCnt}`;
        }
        cell.addEventListener('click', () => openPhotoModal(photos));
        picsWrap.appendChild(cell);
      });
      art.appendChild(head);
      art.appendChild(picsWrap);
    } else {
      art.appendChild(head);
    }

    const rateRow = document.createElement('div');
    rateRow.className = 'rate-row';

    // 태그가 있으면 요청된 형식의 문자열로 만듭니다.
    const tagsHtml = r.tags?.length
      ? `<span class="review-tags">${r.tags.join(' | ')}</span>`
      : '';

    rateRow.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        ${starsHtml(r.rating, true)}
      </div>
      ${tagsHtml}
    `;

    const txt = document.createElement('p');
    txt.className = 'text';
    txt.textContent = r.text || '';

    art.appendChild(rateRow);
    art.appendChild(txt);

    area.appendChild(art);
  });
}

// 필터 버튼
function wireFilters() {
  qsa('.filters .chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      qsa('.filters .chip').forEach((b) => b.classList.remove('on'));
      btn.classList.add('on');
      currentSort = btn.dataset.sort;
      renderReviews(REVIEWS_RAW, currentSort);
    });
  });
}

// 헤더의 "리뷰 N개 ▸" 클릭 시 모든 UGC 사진 모달
function wireHeaderOpenAll(reviews) {
  const btn = qs('#r2c');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const all = [];
    reviews.forEach((r) => (r.photos || []).forEach((u) => all.push(u)));
    openPhotoModal(all);
  });
}

// 사진 모달
function openPhotoModal(urls = []) {
  const modal = qs('#photoModal');
  const grid = qs('#modalGrid');
  grid.innerHTML = '';
  urls.forEach((u) => {
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.style.backgroundImage = `url('${u}')`;
    grid.appendChild(ph);
  });

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  qsa('#photoModal [data-close]').forEach((el) =>
    el.addEventListener('click', closePhotoModal, { once: true })
  );
  qs('#photoModal .modal-bg').addEventListener('click', closePhotoModal, {
    once: true,
  });
}
function closePhotoModal() {
  const modal = qs('#photoModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  qs('#modalGrid').innerHTML = '';
}

// 액션 버튼 핸들러
function wireActions(detail, scope) {
  qsa('.quick-actions .qa').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;

      if (act === 'share') {
        navigator.clipboard?.writeText(location.href);
        alert('링크가 복사되었습니다.');
      } else if (act === 'review') {
        const itemName = detail.name;
        const px = getParam('px'); // 현재 URL에서 'px' 파라미터를 가져옵니다.

        // URL을 조립합니다.
        let reviewUrl = `review.html?type=${scope.type}&id=${
          scope.id
        }&name=${encodeURIComponent(itemName)}`;

        // 만약 px 파라미터가 있었다면, 리뷰 페이지 URL에도 추가해줍니다.
        if (px) {
          reviewUrl += `&px=${px}`;
        }

        location.href = reviewUrl;
      } else if (act === 'save') {
        alert('저장 처리 (연동 예정)');
      } else if (act === 'route') {
        const { name, lat, lng } = detail;
        if (lat && lng) openKakaoMap({ name, lat, lng, mode: 'to' });
        else
          window.open(`https://map.kakao.com/?q=${encodeURIComponent(name)}`);
      }
    });
  });

  qs('.btn-back')?.addEventListener('click', () => history.back());

  qs('#btnMap')?.addEventListener('click', () => {
    const { name, lat, lng } = detail;
    if (lat && lng) openKakaoMap({ name, lat, lng, level: 3, mode: 'map' });
    else window.open(`https://map.kakao.com/?q=${encodeURIComponent(name)}`);
  });

  qs('#morePhotos')?.addEventListener('click', () => {
    const url = new URL('photo.html', location.href);

    // place 모드라면 ?place= 로, 아니면 ?market= 로 보냄
    const placeId = getParam('place');
    const marketId =
      getParam('market') ||
      qs('#name')?.dataset.marketId ||
      getParam('id') ||
      'sinhung';

    if (placeId) url.searchParams.set('place', placeId);
    else url.searchParams.set('market', marketId);

    location.href = url.toString();
  });
  qs('#moreFoods')?.addEventListener('click', () => {
    // 1) dataset → 2) URL ?market → 3) place.market_id → 4) 근접시장
    const ds = qs('#name')?.dataset.marketId;
    let market =
      (ds && DEMO_MARKETS[ds]) ||
      (getParam('market') && DEMO_MARKETS[getParam('market')]) ||
      (detail?.market_id && DEMO_MARKETS[detail.market_id]) ||
      resolveMarketForPlace(detail, null);

    const lat = market.lat;
    const lng = market.lng;
    location.href = `foods.html?id=${encodeURIComponent(
      market.id
    )}&lat=${lat}&lng=${lng}`;
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const floater = document.getElementById('floatingReviewBtn');
  if (floater) {
    floater.addEventListener('click', () => {
      // 기존 상단의 '리뷰쓰기' 빠르게 트리거
      document.querySelector('.qa.js-review')?.click();
    });
  }
});

// ------------------------------
// 부트스트랩
// ------------------------------
// ------------------------------
// 부트스트랩
// ------------------------------
// market.js 파일의 기존 init 함수를 아래 코드로 전체 교체하세요.

(async function init() {
  // 1. 먼저 현재 페이지의 컨텍스트(시장/가게 정보)를 로드합니다.
  const ctx = await loadDetailFromParams();

  // 2. localStorage에 새 리뷰가 있는지 확인합니다.
  const newReviewRaw = localStorage.getItem('newReview');
  if (newReviewRaw) {
    const newReview = JSON.parse(newReviewRaw);
    const { type, id, payload } = newReview;

    // 현재 보고 있는 페이지의 리뷰가 맞는지 확인 후 진행합니다.
    if (type === ctx.scope.type && id === ctx.scope.id) {
      // 3. 새 리뷰를 저장소에 추가합니다.
      appendReview(type, id, payload);

      // 4. 모든 리뷰를 다시 불러와 평점을 재계산합니다.
      const allReviews = loadReviewsFor(type, id);
      if (allReviews.length > 0) {
        const newCount = allReviews.length;
        const newAverage =
          allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / newCount;

        // 5. 현재 컨텍스트(ctx) 객체의 평점 정보를 직접 갱신합니다.
        // 이렇게 해야 잠시 후 render 함수가 새 평점을 사용합니다.
        if (ctx.mode === 'market') {
          ctx.market.rating = newAverage;
          ctx.market.ratingCount = newCount;
        } else if (ctx.mode === 'place') {
          ctx.place.rating = newAverage;
          ctx.place.ratingCount = newCount;
        }
      }
    }
    // 6. 처리했으므로 임시 리뷰 데이터를 삭제합니다.
    localStorage.removeItem('newReview');
  }

  // 7. 갱신된 정보(ctx)로 화면을 렌더링합니다.
  if (ctx.mode === 'place') {
    renderPlace(ctx.place, ctx.parent);
  } else {
    renderMarket(ctx.market);
  }

  await renderMapForContext(ctx);
  wireActions(ctx.mode === 'place' ? ctx.place : ctx.market, ctx.scope);

  REVIEWS_RAW = loadReviewsFor(ctx.scope.type, ctx.scope.id);
  renderReviewHeader(REVIEWS_RAW);
  renderUgcReel(REVIEWS_RAW);
  renderReviews(REVIEWS_RAW, currentSort);
  wireFilters();
  wireHeaderOpenAll(REVIEWS_RAW);
})();
/* === Kakao Map 로더 & 지도 렌더 === */
// home.js와 같은 앱키 사용
const KAKAO_JS_KEY =
  localStorage.getItem('kakao.appkey') || 'e771162067cb5bea30a5efc4c5a69160';
const KAKAO_SDK = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
  KAKAO_JS_KEY
)}&autoload=false`;

function loadKakao() {
  return new Promise((res, rej) => {
    if (window.kakao?.maps) return res();
    const s = document.createElement('script');
    s.src = KAKAO_SDK;
    s.async = true;
    s.onerror = () => rej(new Error('SDK_LOAD_FAILED'));
    s.onload = () => {
      try {
        kakao.maps.load(res);
      } catch (e) {
        rej(e);
      }
    };
    document.head.appendChild(s);
  });
}

function showMapError(msg) {
  const box = document.querySelector('.mapbox');
  if (!box) return;
  const div = document.createElement('div');
  div.style.cssText =
    'display:grid;place-items:center;height:240px;border:1px solid #eee;border-radius:12px;color:#d00;font-size:12px;background:#fff';
  div.textContent = msg;
  box.innerHTML = '';
  box.appendChild(div);
}

const LL = (lat, lng) => new kakao.maps.LatLng(lat, lng);

/** ctx: init()에서 받은 컨텍스트( market | place ) */
async function renderMapForContext(ctx) {
  const box = document.querySelector('.mapbox');
  if (!box) return;

  // 프리뷰 제거 후 실제 지도 DOM 생성
  box.querySelector('.map-preview')?.remove();
  const mapDiv = document.createElement('div');
  mapDiv.className = 'map';
  mapDiv.style.cssText = 'width:100%;height:260px;border-radius:12px;';
  box.appendChild(mapDiv);

  try {
    await loadKakao();
  } catch (e) {
    showMapError(`카카오 지도 로드 실패: ${e.message}`);
    return;
  }

  // 센터/줌: 가게면 더 가깝게(level 2 ~= 30~50m), 시장이면 3
  const isPlace = ctx.mode === 'place';
  const lat = isPlace ? ctx.place.lat : ctx.market.lat;
  const lng = isPlace ? ctx.place.lng : ctx.market.lng;
  const level = isPlace ? 3 : 4;

  const map = new kakao.maps.Map(mapDiv, { center: LL(lat, lng), level });
  const marker = new kakao.maps.Marker({ map, position: LL(lat, lng) });
  const name = isPlace ? ctx.place.name : ctx.market.name;
  new kakao.maps.InfoWindow({
    content: `<div style="padding:4px 6px;font-size:12px">${name}</div>`,
  }).open(map, marker);

  // [지도보기] 버튼: 위치 섹션으로 스크롤 + 해당 좌표로 리센터(줌 재설정)
  const btn = document.getElementById('btnMap');
  if (btn) {
    btn.onclick = () => {
      const isPlace = ctx.mode === 'place';
      const name = isPlace ? ctx.place.name : ctx.market.name;
      const lat = isPlace ? ctx.place.lat : ctx.market.lat;
      const lng = isPlace ? ctx.place.lng : ctx.market.lng;
      const level = isPlace ? 2 : 3; // 가게는 더 줌

      openKakaoMap({ name, lat, lng, level, mode: 'map' });
    };
  }

  // 디버깅/재사용 위해 map 참조 저장(선택)
  mapDiv._kmap = map;
}
function openKakaoMap({ name, lat, lng, level = 3, mode = 'map' }) {
  const base = 'https://map.kakao.com/link';
  const url =
    mode === 'to'
      ? `${base}/to/${encodeURIComponent(name)},${lat},${lng}` // 길찾기
      : `${base}/map/${encodeURIComponent(name)},${lat},${lng},${level}`; // 지도보기(줌 포함)
  window.open(url, '_blank', 'noopener');
}
