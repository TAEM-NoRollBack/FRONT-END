const qs = (s) => document.querySelector(s);
const qsp = (n) => new URLSearchParams(location.search).get(n);
const km = (m) =>
  m >= 1000
    ? (m / 1000).toFixed(m < 10000 ? 1 : 0) + 'km'
    : Math.round(m) + 'm';
function distMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function isOpenNow(place) {
  const now = new Date();
  const [oh, om] = (place.openAt || '00:00').split(':').map(Number);
  const [ch, cm] = (place.closeAt || '23:59').split(':').map(Number);
  const open = new Date(now),
    close = new Date(now);
  open.setHours(oh, om, 0, 0);
  close.setHours(ch, cm, 0, 0);
  if (close <= open) close.setDate(close.getDate() + 1);
  return now >= open && now <= close;
}
function starSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 1.8l2.36 4.78 5.28.77-3.82 3.72.9 5.26L10 14.8l-4.72 2.53.9-5.26L2.36 7.35l5.28-.77L10 1.8Z" fill="#FF83A2"/></svg>`;
}

const DEMO_MARKETS = {
  sinhung: { id: 'sinhung', name: '신흥시장', lat: 37.4419, lng: 127.1295 },
  moran: { id: 'moran', name: '모란시장', lat: 37.4328, lng: 127.129 },
  geumgwang: {
    id: 'geumgwang',
    name: '금광시장',
    lat: 37.449601,
    lng: 127.159294,
  },
};

// ▶ 시장에 매핑된 데모 가게
const DEMO_PLACES = [
  // 신흥시장
  {
    id: 'p1',
    market_id: 'sinhung',
    name: '진선보쌈',
    lat: 37.4426,
    lng: 127.1303,
    rating: 4.5,
    reviews: 23,
    category: '보쌈',
    openAt: '09:00',
    closeAt: '21:00',
    photos: [
      'https://picsum.photos/seed/food1a/640/400',
      'https://picsum.photos/seed/food1b/640/400',
    ],
    quote: '“삼겹살 먹어본 보쌈 중 제일 맛있어요. 김치도 깔끔….”',
  },
  {
    id: 'p2',
    market_id: 'sinhung',
    name: '한촌설렁탕 성남점',
    lat: 37.4413,
    lng: 127.1269,
    rating: 4.0,
    reviews: 23,
    category: '설렁탕',
    openAt: '07:30',
    closeAt: '22:00',
    photos: [
      'https://picsum.photos/seed/food2a/640/400',
      'https://picsum.photos/seed/food2b/640/400',
    ],
    quote: '“깔끔해서 자주 갑니다.”',
  },

  // 모란시장
  {
    id: 'p3',
    market_id: 'moran',
    name: '칼국수집',
    lat: 37.4335,
    lng: 127.1276,
    rating: 4.6,
    reviews: 18,
    category: '칼국수',
    openAt: '10:00',
    closeAt: '20:30',
    photos: [
      'https://picsum.photos/seed/food3a/640/400',
      'https://picsum.photos/seed/food3b/640/400',
    ],
    quote: '“국물 미쳤다.”',
  },
  {
    id: 'p6',
    market_id: 'moran',
    name: '꼬치굽는형',
    lat: 37.4442,
    lng: 127.131,
    rating: 4.7,
    reviews: 9,
    category: '야시장/꼬치',
    openAt: '17:00',
    closeAt: '23:30',
    photos: [
      'https://picsum.photos/seed/food6a/640/400',
      'https://picsum.photos/seed/food6b/640/400',
    ],
    quote: '“저녁만 영업, 숯향.”',
  },

  // 금광시장
  {
    id: 'p4',
    market_id: 'geumgwang',
    name: '만두로드',
    lat: 37.4399,
    lng: 127.1312,
    rating: 4.3,
    reviews: 31,
    category: '만두',
    openAt: '11:00',
    closeAt: '21:30',
    photos: [
      'https://picsum.photos/seed/food4a/640/400',
      'https://picsum.photos/seed/food4b/640/400',
    ],
    quote: '“웨이팅 있지만 금방.”',
  },
  {
    id: 'p5',
    market_id: 'geumgwang',
    name: '시장김밥',
    lat: 37.4411,
    lng: 127.1334,
    rating: 4.1,
    reviews: 12,
    category: '분식',
    openAt: '08:00',
    closeAt: '20:00',
    photos: [
      'https://picsum.photos/seed/food5a/640/400',
      'https://picsum.photos/seed/food5b/640/400',
    ],
    quote: '“가성비 갑.”',
  },
  {
    id: 'p7',
    market_id: 'geumgwang',
    name: '우동명가',
    lat: 37.4407,
    lng: 127.128,
    rating: 3.9,
    reviews: 7,
    category: '우동',
    openAt: '11:00',
    closeAt: '19:30',
    photos: [
      'https://picsum.photos/seed/food7a/640/400',
      'https://picsum.photos/seed/food7b/640/400',
    ],
    quote: '“담백, 재방문 의사.”',
  },
];
// 파일 상단 util 근처에 추가
function pack(obj) {
  // URL-safe base64 (UTF-8 보존)
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function buildPlaceHref(p, marketId) {
  const u = new URL('market.html', location.href);
  u.searchParams.set('market', marketId);
  u.searchParams.set('place', p.id); // 정식 placeId 전달

  // 상세 렌더용 추가 정보 패킹(없으면 비워도 OK)
  const extras = {
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating,
    ratingCount: p.reviews, // foods는 reviews 필드 → 상세는 ratingCount
    photos: (p.photos || []).slice(0, 6),
    addr: p.addr || '',
    hours: p.openAt && p.closeAt ? `${p.openAt} ~ ${p.closeAt}` : '',
  };
  u.searchParams.set('px', pack(extras));
  return u.toString();
}

function findNearbyPlaces(lat, lng, limit = 30, marketId = null) {
  let arr = DEMO_PLACES.filter(
    (p) => !marketId || p.market_id === marketId
  ).map((p) => ({
    ...p,
    _dist: distMeters(lat, lng, p.lat, p.lng),
    _open: isOpenNow(p),
  }));
  return arr
    .sort((a, b) =>
      b.rating !== a.rating ? b.rating - a.rating : a._dist - b._dist
    )
    .slice(0, limit);
}

function renderList(market, places) {
  qs('#title').textContent = `${market.name} 맛집 (${places.length}곳)`;
  const list = qs('#list');
  list.innerHTML = '';

  places.forEach((p) => {
    const open = p._open;
    const el = document.createElement('article');
    el.className = 'item';
    el.innerHTML = `
      <div class="row-top">
        <div class="name">${p.name}</div>
        <div class="rate">${starSvg()} <span>${p.rating.toFixed(
      1
    )}</span><span class="cnt">(${p.reviews}명)</span></div>
      </div>
      <div class="chips">
        <span class="chip">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.6c3.53 0 6.4 2.87 6.4 6.4 0 4.27-6.4 9.6-6.4 9.6S1.6 12.27 1.6 8c0-3.53 2.87-6.4 6.4-6.4Zm0 8A1.6 1.6 0 1 0 8 6.4 1.6 1.6 0 0 0 8 9.6Z" fill="#FF83A2"/></svg>
          현재위치에서 ${km(p._dist)}
        </span>
        <span class="chip ${
          open ? 'open' : 'closed'
        }"><span class="dot"></span>${open ? '영업중' : '영업종료'}</span>
        <span class="chip">${p.category}</span>
      </div>
      <div class="imgs">
        <div class="ph" style="background-image:url('${
          p.photos?.[0] || ''
        }')"></div>
        <div class="ph" style="background-image:url('${
          p.photos?.[1] || p.photos?.[0] || ''
        }')"></div>
      </div>
      <p class="q">${p.quote || ''}</p>
      <div class="hairline"></div>`;

    // ▶ 클릭 시 market.html(가게 상세)로 이동
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const mid = p.market_id || market.id;
      location.href = buildPlaceHref(p, mid);
    });

    list.appendChild(el);
  });
}

function wireBack(marketId) {
  qs('.btn-back')?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = `market.html?id=${encodeURIComponent(marketId)}`;
  });
}

function init() {
  const id = qsp('id') || 'sinhung';
  const base = DEMO_MARKETS[id] || DEMO_MARKETS.sinhung;
  const lat = Number(qsp('lat')) || base.lat;
  const lng = Number(qsp('lng')) || base.lng;

  const market = { ...base, lat, lng };
  const places = findNearbyPlaces(lat, lng, 50, id); // 시장 필터 적용

  renderList(market, places);
  wireBack(market.id);
}
window.addEventListener('DOMContentLoaded', init);
