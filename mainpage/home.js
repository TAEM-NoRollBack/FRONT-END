/* === 경로 & 상수 === */
const SHOP_URL = '../market/market.html';
const MARKET_URL = '../market/market.html';
const STORAGE_KEY = 'nearbyRestaurants';

const MARKET_CATALOG = [
  { id: 'sinhung', name: '신흥시장', lat: 37.4419, lng: 127.1295 },
  { id: 'moran', name: '모란시장', lat: 37.4328, lng: 127.129 },
  { id: 'geumgwang', name: '금광시장', lat: 37.449601, lng: 127.159294 },
];

/* === 헬퍼: 저장된 학교 정보 가져오기 === */
function getSavedSchool() {
  const profileRaw = localStorage.getItem('onboarding_profile');
  if (profileRaw) {
    try {
      const profile = JSON.parse(profileRaw);
      if (profile && profile.school) {
        return { id: profile.schoolId || '', name: profile.school };
      }
    } catch {}
  }
  const a = localStorage.getItem('onboarding.school');
  if (a) {
    try {
      const o = JSON.parse(a);
      if (o && typeof o === 'object')
        return { id: o.id || '', name: o.name || '' };
    } catch {}
    return { id: a, name: a };
  }
  const b = localStorage.getItem('schoolName');
  if (b) return { id: b, name: b };

  return { id: 'eulji', name: '을지대' };
}

/* === 학교 → 좌표 매핑(글로벌에서 쓰게 별도 정의) === */
function resolveSchool(input) {
  const catalog = [
    {
      ids: ['eulji', '을지대', '을지대학교 성남캠퍼스'],
      name: '을지대',
      lat: 37.4597,
      lng: 127.1652,
    },
    {
      ids: ['gachon', '가천대학교', '가천대학교 글로벌캠퍼스'],
      name: '가천대학교',
      lat: 37.45125,
      lng: 127.129277,
    },
    {
      ids: ['shingu', 'singu', '신구대학교', '신구대'],
      name: '신구대학교',
      lat: 37.446899,
      lng: 127.167517,
    },
    {
      ids: ['dongseoul', 'donseoul', '동서울대학교'],
      name: '동서울대학교',
      lat: 37.45944,
      lng: 127.12944,
    },
  ];
  const idKey = (input?.id || '').toString().toLowerCase().replace(/\s+/g, '');
  const nameKey = (input?.name || '').toString().trim();
  let item =
    catalog.find((x) => x.ids.some((k) => k.toLowerCase() === idKey)) ||
    catalog.find((x) => x.ids.includes(nameKey)) ||
    catalog.find((x) => nameKey.includes(x.name)) ||
    catalog[0];
  return { ...item };
}

/* === 거리/최근접 시장 유틸 === */
function pack(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return '';
  }
}
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function fmtMeters(m) {
  return m >= 1000
    ? (m / 1000).toFixed(m < 10000 ? 1 : 0) + 'km'
    : Math.round(m) + 'm';
}
function nearestMarketFor(lat, lng) {
  let best = null;
  for (const m of MARKET_CATALOG) {
    const dist = haversineMeters(lat, lng, m.lat, m.lng);
    if (!best || dist < best.dist) best = { ...m, dist };
  }
  return best; // { id, name, lat, lng, dist }
}

/* === 상세 페이지 링크 빌더 === */
function buildDetailHref(r) {
  const placeData = {
    name: r.name,
    rating: r.rating,
    ratingCount: r.ratingCnt,
    addr: r.addr,
    photos: r.photos,
    lat: r.lat,
    lng: r.lng,
  };

  const nearest =
    typeof r.lat === 'number' && typeof r.lng === 'number'
      ? nearestMarketFor(r.lat, r.lng)
      : { id: 'sinhung' };

  const u = new URL(MARKET_URL, location.href);
  u.searchParams.set('place', r.id);
  u.searchParams.set('market', nearest.id);

  if (typeof r.lat === 'number' && typeof r.lng === 'number') {
    u.searchParams.set('lat', r.lat);
    u.searchParams.set('lng', r.lng);
  }
  u.searchParams.set('px', pack(placeData));
  return u.toString();
}

/* === 라벨/타이틀 동기화 === */
(function syncSchoolLabel() {
  const labelEl = document.getElementById('schoolLabel');
  const nearbyTitle = document.getElementById('nearbyTitle');
  const saved = getSavedSchool(); // {id,name}
  if (labelEl) labelEl.textContent = saved.name || '을지대';
  if (nearbyTitle)
    nearbyTitle.textContent = `${saved.name || '을지대'} 주변 맛집`;
})();

/* === 검색 UX: 버튼 + Enter로 research.html 이동 === */
(function wireSearchBar() {
  const $q = document.getElementById('q');
  const goSearch = () => {
    const keyword = $q?.value.trim() || '';
    const url = new URL('research.html', location.href);
    url.searchParams.set('mode', 'search');
    if (keyword) url.searchParams.set('keyword', keyword);
    url.searchParams.set('focus', '1'); // 입력에 포커스
    location.href = url.toString();
  };
  document.querySelector('.btn-search')?.addEventListener('click', goSearch);
  $q?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goSearch();
    }
  });
})();

/* === 칩 → research.html 라우팅 === */
(function wireChips() {
  const chips = document.querySelectorAll('.chips-row .chip');

  const withGeo = (cb) => {
    const saved = getSavedSchool();
    const school = resolveSchool(saved);
    const fallback = { latitude: school.lat, longitude: school.lng };
    if (!navigator.geolocation) return cb(fallback, true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => cb(coords, false),
      () => cb(fallback, true),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const goResearch = (params = {}) => {
    const url = new URL('research.html', location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
    location.href = url.toString();
  };

  chips.forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();

      // 상세검색(필터) → 검색 화면으로
      if (btn.classList.contains('chip--filter')) {
        goResearch({ mode: 'search', focus: '1' });
        return;
      }

      // 내 주변 전통시장
      if (label.includes('내 주변 전통시장')) {
        withGeo((c) =>
          goResearch({
            mode: 'nearby',
            scope: 'market',
            lat: c.latitude,
            lng: c.longitude,
          })
        );
        return;
      }

      // 내 주변 맛집
      if (label.includes('내 주변 맛집')) {
        withGeo((c) =>
          goResearch({
            mode: 'nearby',
            scope: 'place',
            lat: c.latitude,
            lng: c.longitude,
          })
        );
        return;
      }

      // 점심식사(가까운 점심 카테고리)
      if (label.includes('점심')) {
        withGeo((c) =>
          goResearch({
            mode: 'category',
            scope: 'place',
            cat: 'lunch',
            lat: c.latitude,
            lng: c.longitude,
          })
        );
        return;
      }

      // 신규 맛집
      if (label.includes('신규')) {
        withGeo((c) =>
          goResearch({
            mode: 'category',
            scope: 'place',
            cat: 'new',
            lat: c.latitude,
            lng: c.longitude,
          })
        );
        return;
      }

      // 학교 주변 맛집 (칩 문구가 '을지대 맛집'이어도 실제 저장된 학교 기준)
      if (label.includes('맛집') && label.includes('대')) {
        const saved = getSavedSchool();
        goResearch({
          mode: 'school',
          scope: 'place',
          school: saved.id || saved.name || 'eulji',
        });
        return;
      }

      // 그 외 텍스트는 키워드 검색으로
      goResearch({ mode: 'search', keyword: label, focus: '1' });
    });
  });
})();

/* === 프론트 저장용 샘플 데이터 === */
const initialRestaurants = [
  {
    id: 'r1',
    emoji: '🍲',
    category: '추천 맛집',
    name: '김치찜의 정석',
    rating: 4.5,
    ratingCnt: 23,
    badges: [],
    desc: '김치찌개가 진하고 깔끔해요. 가까운 시장에서 매일 아침 재료를 공수!',
    lat: 37.4502,
    lng: 127.1599,
    photos: [
      'https://picsum.photos/seed/h1/600/400',
      'https://picsum.photos/seed/h2/600/400',
    ],
  },
  {
    id: 'r2',
    emoji: '🍜',
    category: '추천 맛집',
    name: '을지마라탕',
    rating: 4.0,
    ratingCnt: 23,
    badges: ['한식 • 중식', '도보 6분'],
    desc: '얼얼한 맛이 매력! 캠퍼스에서 도보 6분.',
    lat: 37.4422,
    lng: 127.1301,
    photos: [
      'https://picsum.photos/seed/h3/600/400',
      'https://picsum.photos/seed/h4/600/400',
    ],
  },
];

function loadRestaurants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRestaurants));
    return [...initialRestaurants];
  }
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [...initialRestaurants];
  }
}
function saveRestaurants(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* === DOM 유틸 === */
const $list = document.getElementById('nearbyList');

function createStarSvg() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '15');
  svg.setAttribute('viewBox', '0 0 16 15');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M7.9996 12.5662L4.12169 14.8593C3.95037 14.9664 3.77127 15.0122 3.58439 14.9969C3.3975 14.9816 3.23397 14.9205 3.09381 14.8135C2.95364 14.7065 2.84462 14.5729 2.76675 14.4126C2.68888 14.2524 2.67331 14.0727 2.72003 13.8733L3.74791 9.53933L0.313855 6.62708C0.158115 6.4895 0.0609338 6.33265 0.0223104 6.15654C-0.016313 5.98043 -0.0047883 5.8086 0.0568846 5.64105C0.118557 5.4735 0.212001 5.33591 0.337216 5.22829C0.46243 5.12066 0.633744 5.05187 0.851156 5.02191L5.38318 4.63208L7.13525 0.550346C7.21312 0.366898 7.33397 0.229311 7.49781 0.137586C7.66165 0.045862 7.82891 0 7.9996 0C8.17029 0 8.33756 0.045862 8.50139 0.137586C8.66523 0.229311 8.78609 0.366898 8.86396 0.550346L10.616 4.63208L15.148 5.02191C15.3661 5.05248 15.5374 5.12128 15.662 5.22829C15.7866 5.3353 15.88 5.47289 15.9423 5.64105C16.0046 5.80921 16.0164 5.98135 15.9778 6.15746C15.9392 6.33357 15.8417 6.49011 15.6853 6.62708L12.2513 9.53933L13.2792 13.8733C13.3259 14.072 13.3103 14.2518 13.2325 14.4126C13.1546 14.5735 13.0456 14.7071 12.9054 14.8135C12.7652 14.9199 12.6017 14.981 12.4148 14.9969C12.2279 15.0128 12.0488 14.967 11.8775 14.8593L7.9996 12.5662Z'
  );
  path.setAttribute('fill', '#FF83A2');
  svg.appendChild(path);
  return svg;
}

/* === 카드 생성 === */
function createCard(r) {
  const $article = document.createElement('article');
  $article.className = 'card clickable';
  $article.tabIndex = 0;
  $article.setAttribute('role', 'button');

  const $header = document.createElement('header');
  $header.className = 'card-h';

  const $rowLeft = document.createElement('div');
  $rowLeft.className = 'row-left';
  $rowLeft.innerHTML = `
    <span class="cat"><span class="emoji">${r.emoji || '🍽️'}</span> ${
    r.category || '추천 맛집'
  }</span>
    <span class="name">${r.name}</span>
  `;

  const $rating = document.createElement('div');
  $rating.className = 'rating';
  $rating.appendChild(createStarSvg());
  const $cnt = document.createElement('span');
  $cnt.className = 'cnt';
  const score = typeof r.rating === 'number' ? r.rating.toFixed(1) : r.rating;
  $cnt.textContent = `${score} (${r.ratingCnt || 0}개)`;
  $rating.appendChild($cnt);

  $header.appendChild($rowLeft);
  $header.appendChild($rating);
  $article.appendChild($header);

  // 배지 묶음
  let $badges = null;
  if (r.badges && r.badges.length) {
    $badges = document.createElement('div');
    $badges.className = 'shop-badges';
    r.badges.forEach((b) => {
      const $b = document.createElement('span');
      $b.className = 'pbadge';
      $b.textContent = b;
      $badges.appendChild($b);
    });
    $article.appendChild($badges);
  }

  // ✅ 가까운 시장 칩(거리 포함)
  if (typeof r.lat === 'number' && typeof r.lng === 'number') {
    const near = nearestMarketFor(r.lat, r.lng);
    if (near) {
      if (!$badges) {
        $badges = document.createElement('div');
        $badges.className = 'shop-badges';
        $article.appendChild($badges);
      }
      const $near = document.createElement('span');
      $near.className = 'pbadge';
      $near.textContent = `가까운 시장: ${near.name} · ${fmtMeters(near.dist)}`;
      $badges.appendChild($near);
    }
  }

  // 갤러리(선택)
  const $gallery = document.createElement('div');
  $gallery.className = 'gallery';
  const $ph1 = document.createElement('div');
  const $ph2 = document.createElement('div');
  $ph1.className = 'ph';
  $ph2.className = 'ph';
  if (Array.isArray(r.photos) && r.photos[0])
    $ph1.style.backgroundImage = `url('${r.photos[0]}')`;
  if (Array.isArray(r.photos) && r.photos[1])
    $ph2.style.backgroundImage = `url('${r.photos[1]}')`;
  $gallery.appendChild($ph1);
  $gallery.appendChild($ph2);
  $article.appendChild($gallery);

  if (r.desc) {
    const $desc = document.createElement('p');
    $desc.className = 'desc';
    $desc.textContent = r.desc;
    $article.appendChild($desc);
  }

  // ✅ 상세 페이지 이동 연결
  const href = buildDetailHref(r);
  if (href) {
    $article.dataset.href = href;
    $article.setAttribute('aria-label', `${r.name} 상세로 이동`);
    const open = () => (location.href = href);
    $article.addEventListener('click', open);
    $article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  } else {
    $article.addEventListener('click', () =>
      alert('이 카드에는 아직 연결된 상세 페이지가 없어요.')
    );
  }

  return $article;
}

let restaurants = loadRestaurants();
function renderRestaurants() {
  const frag = document.createDocumentFragment();
  restaurants.forEach((r) => frag.appendChild(createCard(r)));
  $list.innerHTML = '';
  $list.appendChild(frag);
}
renderRestaurants();

/* === 외부에서 추가/리셋용 === */
window.addRestaurant = function addRestaurant(newItem) {
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    emoji: '🍽️',
    category: '추천 맛집',
    name: '새 맛집',
    rating: 4.0,
    ratingCnt: 1,
    badges: [],
    desc: '',
    ...newItem,
  };
  restaurants.push(item);
  saveRestaurants(restaurants);
  renderRestaurants();
};
window.resetRestaurants = function resetRestaurants() {
  restaurants = [...initialRestaurants];
  saveRestaurants(restaurants);
  renderRestaurants();
};

/* === Kakao Map === */
(function () {
  function showMapError(msg) {
    const box = document.getElementById('mapBox');
    if (!box) return;
    const div = document.createElement('div');
    div.style.cssText = `
      position:absolute; inset:0; display:grid; place-items:center;
      background:#fff; color:#d00; font-size:12px; text-align:center; padding:10px;
    `;
    div.innerHTML = msg;
    box.appendChild(div);
  }

  const KAKAO_JS_KEY =
    localStorage.getItem('kakao.appkey') || 'e771162067cb5bea30a5efc4c5a69160';
  const SDK = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
    KAKAO_JS_KEY
  )}&autoload=false`;

  function loadKakao() {
    return new Promise((res, rej) => {
      if (window.kakao?.maps) return res();
      const s = document.createElement('script');
      s.src = SDK;
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

  const LL = (lat, lng) => new kakao.maps.LatLng(lat, lng);
  function fitBounds(map, coords) {
    if (!coords?.length) return;
    const b = new kakao.maps.LatLngBounds();
    coords.forEach((c) => b.extend(LL(c.lat, c.lng)));
    map.setBounds(b, 20, 20, 20, 20);
  }

  /* 4) 데모 마켓/플레이스 (지도 오버레이용) */
  const MARKETS = [
    { id: 'sinhung', name: '신흥시장', lat: 37.4419, lng: 127.1295 },
    { id: 'moran', name: '모란시장', lat: 37.4328, lng: 127.129 },
    { id: 'geumgwang', name: '금광시장', lat: 37.449601, lng: 127.159294 },
  ];
  const PLACES = [
    // 신흥시장
    {
      id: 'p1',
      market_id: 'sinhung',
      name: '진선보쌈',
      lat: 37.4426,
      lng: 127.1303,
      rating: 4.5,
      photos: [
        'https://picsum.photos/seed/food1a/640/400',
        'https://picsum.photos/seed/food1b/640/400',
      ],
      reviews: 23,
      tags: ['lunch'],
    },
    {
      id: 'p2',
      market_id: 'sinhung',
      name: '한촌설렁탕 성남점',
      lat: 37.4413,
      lng: 127.1269,
      rating: 4.0,
      photos: [
        'https://picsum.photos/seed/food2a/640/400',
        'https://picsum.photos/seed/food2b/640/400',
      ],
      reviews: 23,
      tags: ['new'],
    },

    // 모란시장
    {
      id: 'p3',
      market_id: 'moran',
      name: '칼국수집',
      lat: 37.4335,
      lng: 127.1276,
      rating: 4.6,
      photos: [
        'https://picsum.photos/seed/food3a/640/400',
        'https://picsum.photos/seed/food3b/640/400',
      ],
      reviews: 18,
      tags: ['lunch'],
    },
    {
      id: 'p6',
      market_id: 'moran',
      name: '꼬치굽는형',
      lat: 37.4442,
      lng: 127.131,
      rating: 4.7,
      photos: [
        'https://picsum.photos/seed/food6a/640/400',
        'https://picsum.photos/seed/food6b/640/400',
      ],
      reviews: 9,
      tags: ['new'],
    },

    // 금광시장
    {
      id: 'p4',
      market_id: 'geumgwang',
      name: '만두로드',
      lat: 37.4399,
      lng: 127.1312,
      rating: 4.3,
      photos: [
        'https://picsum.photos/seed/food4a/640/400',
        'https://picsum.photos/seed/food4b/640/400',
      ],
      reviews: 31,
      tags: ['lunch'],
    },
    {
      id: 'p5',
      market_id: 'geumgwang',
      name: '시장김밥',
      lat: 37.4411,
      lng: 127.1334,
      rating: 4.1,
      photos: [
        'https://picsum.photos/seed/food5a/640/400',
        'https://picsum.photos/seed/food5b/640/400',
      ],
      reviews: 12,
      tags: ['new'],
    },
    {
      id: 'p7',
      market_id: 'geumgwang',
      name: '우동명가',
      lat: 37.4407,
      lng: 127.128,
      rating: 3.9,
      photos: [
        'https://picsum.photos/seed/food7a/640/400',
        'https://picsum.photos/seed/food7b/640/400',
      ],
      reviews: 7,
      tags: ['lunch'],
    },
  ];

  function buildPlaceHrefHome(p) {
    const u = new URL(MARKET_URL, location.href);
    u.searchParams.set('place', p.id);
    u.searchParams.set('market', p.market_id);
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      u.searchParams.set('lat', p.lat);
      u.searchParams.set('lng', p.lng);
    }
    u.searchParams.set(
      'px',
      pack({
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        rating: p.rating,
        ratingCount: p.reviews || 0,
        photos: Array.isArray(p.photos) ? p.photos.slice(0, 6) : [],
      })
    );
    return u.toString();
  }

  function buildMarketHref(m) {
    const u = new URL(MARKET_URL, location.href);
    u.searchParams.set('market', m.id);
    if (typeof m.lat === 'number' && typeof m.lng === 'number') {
      u.searchParams.set('lat', m.lat);
      u.searchParams.set('lng', m.lng);
    }
    u.searchParams.set(
      'px',
      pack({ id: m.id, name: m.name, lat: m.lat, lng: m.lng })
    );
    return u.toString();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const box = document.getElementById('mapBox');
    if (!box) return;

    box.querySelector('.map-preview')?.remove();
    const mapDiv = document.createElement('div');
    mapDiv.className = 'map';
    box.appendChild(mapDiv);

    try {
      await loadKakao();
    } catch (e) {
      showMapError(`카카오 SDK 로드 실패: ${e.message}`);
      return;
    }

    const saved = getSavedSchool();
    const school = resolveSchool(saved);
    const center = { lat: school.lat, lng: school.lng };

    const DESIRED_LEVEL = 3;
    const map = new kakao.maps.Map(mapDiv, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: DESIRED_LEVEL,
    });

    function addLabelOverlay({ lat, lng, href, name, kind = 'place' }) {
      const a = document.createElement('a');
      a.className = `map-label ${kind === 'market' ? 'market' : 'place'}`;
      a.href = href;
      const color = kind === 'market' ? '#59F1FF' : '#FF83A2';
      a.innerHTML = `
        <svg class="pin" xmlns="http://www.w3.org/2000/svg" width="19" height="28" viewBox="0 0 19 28" aria-hidden="true" style="color:${color}">
          <path d="M9.5 13.3C9.94556 13.3 10.3868 13.2095 10.7984 13.0336C11.21 12.8577 11.5841 12.5999 11.8991 12.2749C12.2142 11.9499 12.4641 11.564 12.6346 11.1394C12.8051 10.7148 12.8929 10.2596 12.8929 9.8C12.8929 8.87174 12.5354 7.9815 11.8991 7.32513C11.2628 6.66875 10.3998 6.3 9.5 6.3C8.60016 6.3 7.73717 6.66875 7.10089 7.32513C6.4646 7.9815 6.10714 8.87174 6.10714 9.8C6.10714 10.2596 6.1949 10.7148 6.36541 11.1394C6.53591 11.564 6.78583 11.9499 7.10089 12.2749C7.73717 12.9313 8.60016 13.3 9.5 13.3ZM9.5 0C14.7386 0 19 4.382 19 9.8C19 17.15 9.5 28 9.5 28C9.5 28 0 17.15 0 9.8C0 7.20088 1.00089 4.70821 2.78249 2.87035C4.56408 1.0325 6.98044 0 9.5 0Z" fill="currentColor"/>
        </svg>
        <span class="badge">${name}</span>
      `;
      const ov = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: a,
        yAnchor: 1,
        xAnchor: 0,
        clickable: true,
        zIndex: kind === 'market' ? 3 : 2,
      });
      ov.setMap(map);
      return ov;
    }

    const coords = [];
    MARKETS.forEach((m) => {
      addLabelOverlay({
        lat: m.lat,
        lng: m.lng,
        href: buildMarketHref(m),
        name: m.name,
        kind: 'market',
      });
      coords.push({ lat: m.lat, lng: m.lng });
    });

    PLACES.forEach((p) => {
      addLabelOverlay({
        lat: p.lat,
        lng: p.lng,
        href: buildPlaceHrefHome(p),
        name: p.name,
        kind: 'place',
      });
      coords.push({ lat: p.lat, lng: p.lng });
    });

    const FOCUS_ON_SCHOOL = true;
    if (FOCUS_ON_SCHOOL) {
      map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
      map.setLevel(DESIRED_LEVEL);
    } else {
      fitBounds(map, coords.length ? coords : [center]);
    }

    // 현재 위치 버튼
    const locBtn = document.createElement('button');
    locBtn.type = 'button';
    locBtn.textContent = '현재위치';
    Object.assign(locBtn.style, {
      position: 'absolute',
      right: '8px',
      top: '8px',
      zIndex: 5,
      padding: '6px 10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '12px',
    });
    document.getElementById('mapBox')?.appendChild(locBtn);

    locBtn.onclick = () => {
      if (!navigator.geolocation) return alert('GPS를 지원하지 않아요');
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const here = new kakao.maps.LatLng(coords.latitude, coords.longitude);
          map.setCenter(here);
          new kakao.maps.Marker({ map, position: here });
        },
        () => alert('현재 위치를 가져오지 못했어요.')
      );
    };
  });
})();
