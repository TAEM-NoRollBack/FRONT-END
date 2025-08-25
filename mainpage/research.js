// ===== 공통 유틸 & 상태 =====
const $kw = document.getElementById('kw');
const $clear = document.getElementById('kwClear');
const $list = document.getElementById('resultList');
const params = new URLSearchParams(location.search);

// 모드/스코프/좌표/카테고리/키워드
const MODE =
  params.get('mode') || (params.get('keyword') ? 'search' : 'default');
const SCOPE = params.get('scope') || 'place'; // 'place' | 'market'
const LAT = parseFloat(params.get('lat'));
const LNG = parseFloat(params.get('lng'));
const CAT = params.get('cat'); // 'lunch' | 'new'
const FOCUS = params.get('focus') === '1';
const initialKeyword = params.get('keyword') || '';

// ===== 학교 저장/좌표 =====
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

// ===== 지도/거리 유틸 =====
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
function pack(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return '';
  }
}

// ===== 데이터셋(마켓/가게) =====
const MARKETS = [
  {
    id: 'sinhung',
    name: '신흥시장',
    lat: 37.4419,
    lng: 127.1295,
    rating: 4.5,
    count: 8,
    area: '성남',
    type: '전통시장',
    phone: '031-753-8989',
    hours: '월~일 09:00 ~ 20:00',
    address: '경기도 성남시 수정구 희망로 343번길 9',
  },
  {
    id: 'moran',
    name: '모란시장',
    lat: 37.4328,
    lng: 127.129,
    rating: 4.2,
    count: 17,
    area: '성남',
    type: '전통시장',
    phone: '031-000-1111',
    hours: '월~일 10:00 ~ 21:00',
    address: '경기도 성남시 중원구 모란로 1',
  },
  {
    id: 'geumgwang',
    name: '금광시장',
    lat: 37.449601,
    lng: 127.159294,
    rating: 4.0,
    count: 23,
    area: '성남',
    type: '전통시장',
    phone: '031-555-0000',
    hours: '화~일 10:00 ~ 20:00 (월 휴무)',
    address: '경기도 성남시 중원구 금광동 123-4',
  },
];

const PLACES = [
  {
    id: 'p1',
    market_id: 'sinhung',
    name: '진선보쌈',
    lat: 37.4426,
    lng: 127.1303,
    rating: 4.5,
    reviews: 23,
    tags: ['lunch'],
    photos: [
      'https://picsum.photos/seed/food1a/640/400',
      'https://picsum.photos/seed/food1b/640/400',
    ],
  },
  {
    id: 'p2',
    market_id: 'sinhung',
    name: '한촌설렁탕 성남점',
    lat: 37.4413,
    lng: 127.1269,
    rating: 4.0,
    reviews: 23,
    tags: ['new'],
    photos: [
      'https://picsum.photos/seed/food2a/640/400',
      'https://picsum.photos/seed/food2b/640/400',
    ],
  },
  {
    id: 'p3',
    market_id: 'moran',
    name: '칼국수집',
    lat: 37.4335,
    lng: 127.1276,
    rating: 4.6,
    reviews: 18,
    tags: ['lunch'],
    photos: [
      'https://picsum.photos/seed/food3a/640/400',
      'https://picsum.photos/seed/food3b/640/400',
    ],
  },
  {
    id: 'p6',
    market_id: 'moran',
    name: '꼬치굽는형',
    lat: 37.4442,
    lng: 127.131,
    rating: 4.7,
    reviews: 9,
    tags: ['new'],
    photos: [
      'https://picsum.photos/seed/food6a/640/400',
      'https://picsum.photos/seed/food6b/640/400',
    ],
  },
  {
    id: 'p4',
    market_id: 'geumgwang',
    name: '만두로드',
    lat: 37.4399,
    lng: 127.1312,
    rating: 4.3,
    reviews: 31,
    tags: ['lunch'],
    photos: [
      'https://picsum.photos/seed/food4a/640/400',
      'https://picsum.photos/seed/food4b/640/400',
    ],
  },
  {
    id: 'p5',
    market_id: 'geumgwang',
    name: '시장김밥',
    lat: 37.4411,
    lng: 127.1334,
    rating: 4.1,
    reviews: 12,
    tags: ['new'],
    photos: [
      'https://picsum.photos/seed/food5a/640/400',
      'https://picsum.photos/seed/food5b/640/400',
    ],
  },
  {
    id: 'p7',
    market_id: 'geumgwang',
    name: '우동명가',
    lat: 37.4407,
    lng: 127.128,
    rating: 3.9,
    reviews: 7,
    tags: ['lunch'],
    photos: [
      'https://picsum.photos/seed/food7a/640/400',
      'https://picsum.photos/seed/food7b/640/400',
    ],
  },
];

// 빠른 lookup
const MARKET_BY_ID = MARKETS.reduce((m, x) => ((m[x.id] = x), m), {});

// ===== 상단 학교 라벨 동기화 =====
(function syncSchoolLabel() {
  const labelEl = document.getElementById('schoolLabel');
  const saved = getSavedSchool();
  if (labelEl) labelEl.textContent = saved.name || '을지대';
})();

// ===== 키워드 입력 초기화/클리어 =====
$kw.value = initialKeyword;
const syncClearBtn = () => {
  $clear.style.visibility = $kw.value ? 'visible' : 'hidden';
};
syncClearBtn();

$kw.addEventListener('input', () => {
  syncClearBtn();
  if (MODE === 'search' || !MODE) {
    // 실시간 검색
    renderSearch($kw.value.trim());
  }
});

$clear.addEventListener('click', () => {
  $kw.value = '';
  syncClearBtn();
  $kw.focus();
  const url = new URL(location.href);
  url.searchParams.delete('keyword');
  history.replaceState({}, '', url);
  if (MODE === 'search') renderSearch('');
});

if (FOCUS) $kw.focus();

// ===== 렌더 공통 =====
const starSvg = `
<svg class="r-star" viewBox="0 0 16 15" aria-hidden="true">
  <path d="M7.9996 12.5662L4.12169 14.8593C3.95037 14.9664 3.77127 15.0122 3.58439 14.9969C3.3975 14.9816 3.23397 14.9205 3.09381 14.8135C2.95364 14.7065 2.84462 14.5729 2.76675 14.4126C2.68888 14.2524 2.67331 14.0727 2.72003 13.8733L3.74791 9.53933L0.313855 6.62708C0.158115 6.4895 0.0609338 6.33265 0.0223104 6.15654C-0.016313 5.98043 -0.0047883 5.8086 0.0568846 5.64105C0.118557 5.4735 0.212001 5.33591 0.337216 5.22829C0.46243 5.12066 0.633744 5.05187 0.851156 5.02191L5.38318 4.63208L7.13525 0.550346C7.21312 0.366898 7.33397 0.229311 7.49781 0.137586C7.66165 0.045862 7.82891 0 7.9996 0C8.17029 0 8.33756 0.045862 8.50139 0.137586C8.66523 0.229311 8.78609 0.366898 8.86396 0.550346L10.616 4.63208L15.148 5.02191C15.3661 5.05248 15.5374 5.12128 15.662 5.22829C15.7866 5.3353 15.88 5.47289 15.9423 5.64105C16.0046 5.80921 16.0164 5.98135 15.9778 6.15746C15.9392 6.33357 15.8417 6.49011 15.6853 6.62708L12.2513 9.53933L13.2792 13.8733C13.3259 14.072 13.3103 14.2518 13.2325 14.4126C13.1546 14.5735 13.0456 14.7071 12.9054 14.8135C12.7652 14.9199 12.6017 14.981 12.4148 14.9969C12.2279 15.0128 12.0488 14.967 11.8775 14.8593L7.9996 12.5662Z" fill="#FF83A2"/>
</svg>`;

// 마켓 카드
function marketCard(d, idx) {
  return `
  <article class="r-card" data-kind="market"
    data-id="${d.id}"
    data-name="${d.name}"
    data-area="${d.area || ''}"
    data-type="${d.type || ''}"
    data-rating="${d.rating || 0}"
    data-reviews="${d.count || 0}"
    data-dist="${d.distanceText || ''}"
    data-addr="${d.address || ''}"
    data-phone="${d.phone || ''}"
    data-hours="${d.hours || ''}">
    <header class="r-head">
      <div class="r-left">
        <span class="r-index">${idx + 1}.</span>
        <span class="r-title">${d.name}</span>
      </div>
      <div class="r-rate">
        ${starSvg}
        <span>${(d.rating || 0).toFixed(1)} (${d.count || 0}명)</span>
      </div>
    </header>
    <div class="r-tags">
      ${d.distanceText ? `<span class="tag pin">${d.distanceText}</span>` : ''}
      <span class="tag">${'영업중'}</span>
    </div>
    <div class="r-photos">
      <div class="ph"></div>
      <div class="ph"></div>
    </div>
    <p class="r-desc">${d.desc || ''}</p>
  </article>`;
}

// 가게(플레이스) 카드
function placeCard(p, idx) {
  const m = MARKET_BY_ID[p.market_id];
  return `
  <article class="r-card" data-kind="place"
    data-place="${p.id}"
    data-market="${p.market_id}"
    data-name="${p.name}"
    data-rating="${p.rating || 0}"
    data-reviews="${p.reviews || 0}"
    data-lat="${p.lat}"
    data-lng="${p.lng}">
    <header class="r-head">
      <div class="r-left">
        <span class="r-index">${idx + 1}.</span>
        <span class="r-title">${p.name}</span>
      </div>
      <div class="r-rate">
        ${starSvg}
        <span>${(p.rating || 0).toFixed(1)} (${p.reviews || 0}명)</span>
      </div>
    </header>
    <div class="r-tags">
      ${p.distanceText ? `<span class="tag pin">${p.distanceText}</span>` : ''}
      ${m ? `<span class="tag">${m.name}</span>` : ''}
      <span class="tag">${'영업중'}</span>
    </div>
    <div class="r-photos">
      <div class="ph" style="${
        p.photos?.[0] ? `background-image:url('${p.photos[0]}')` : ''
      }"></div>
      <div class="ph" style="${
        p.photos?.[1] ? `background-image:url('${p.photos[1]}')` : ''
      }"></div>
    </div>
    <p class="r-desc">${p.desc || ''}</p>
  </article>`;
}

// ===== 빌더들 =====
function buildMarketHref(m) {
  const u = new URL('../market/market.html', location.href);
  u.searchParams.set('id', m.id); // 레거시 호환
  u.searchParams.set('market', m.id); // 신규 파라미터
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
function buildPlaceHref(p) {
  const u = new URL('../market/market.html', location.href);
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

// ===== 데이터 선택 로직 =====
function nearestByCoords(items, lat, lng, limit = 20) {
  return items
    .map((x) => {
      const d = haversineMeters(lat, lng, x.lat, x.lng);
      return { ...x, distance: d, distanceText: fmtMeters(d) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function filterByTag(items, tag) {
  if (!tag) return items.slice();
  return items.filter((x) => Array.isArray(x.tags) && x.tags.includes(tag));
}

function searchItems(keyword) {
  const q = (keyword || '').trim();
  const qlow = q.toLowerCase();
  if (!q) return { markets: MARKETS.slice(0, 10), places: PLACES.slice(0, 10) };
  const markets = MARKETS.filter((m) => m.name.includes(q));
  const places = PLACES.filter((p) => p.name.toLowerCase().includes(qlow));
  return { markets, places };
}

// ===== 렌더 함수 =====
function renderMarkets(arr) {
  if (!arr.length) {
    $list.innerHTML = `<p style="padding:12px;color:#666">결과가 없습니다.</p>`;
    return;
  }
  $list.innerHTML = arr.map((d, i) => marketCard(d, i)).join('');
}

function renderPlaces(arr) {
  if (!arr.length) {
    $list.innerHTML = `<p style="padding:12px;color:#666">결과가 없습니다.</p>`;
    return;
  }
  $list.innerHTML = arr.map((p, i) => placeCard(p, i)).join('');
}

function renderSearch(keyword) {
  const { markets, places } = searchItems(keyword);
  const merged = [
    ...markets.map((m, i) => ({
      kind: 'market',
      idx: i,
      node: marketCard(m, i),
    })),
    ...places.map((p, i) => ({ kind: 'place', idx: i, node: placeCard(p, i) })),
  ];
  if (!merged.length) {
    $list.innerHTML = `<p style="padding:12px;color:#666">검색 결과가 없습니다.</p>`;
    return;
  }
  // 간단히 마켓 먼저, 그다음 플레이스
  $list.innerHTML = merged
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.idx - b.idx)
    .map((x) => x.node)
    .join('');
}

// ===== 초기 렌더 분기 =====
(function bootstrap() {
  // 모드 설명:
  // - nearby + scope=market|place + lat,lng
  // - category + cat=lunch|new + lat,lng (없으면 학교 중심)
  // - school + scope=place (저장된 학교 중심)
  // - search + keyword (없으면 전체 탐색)
  // - default: 학교 주변 place
  const saved = getSavedSchool();
  const school = resolveSchool(saved);
  const baseLat = isFinite(LAT) ? LAT : school.lat;
  const baseLng = isFinite(LNG) ? LNG : school.lng;

  switch (MODE) {
    case 'nearby': {
      if (SCOPE === 'market') {
        const list = nearestByCoords(MARKETS, baseLat, baseLng, 20);
        renderMarkets(list);
      } else {
        const list = nearestByCoords(PLACES, baseLat, baseLng, 20);
        renderPlaces(list);
      }
      break;
    }
    case 'category': {
      const filtered = filterByTag(PLACES, CAT);
      const list = nearestByCoords(filtered, baseLat, baseLng, 20);
      renderPlaces(list);
      break;
    }
    case 'school': {
      const list = nearestByCoords(PLACES, school.lat, school.lng, 20);
      renderPlaces(list);
      break;
    }
    case 'search': {
      renderSearch(initialKeyword);
      break;
    }
    default: {
      // 기본: 학교 주변 플레이스
      const list = nearestByCoords(PLACES, school.lat, school.lng, 20);
      renderPlaces(list);
      break;
    }
  }
})();

// ===== 클릭 위임(마켓/가게 → 상세) =====
document.addEventListener('click', (e) => {
  const card = e.target.closest('.r-card');
  if (!card || !$list.contains(card)) return;

  const kind = card.dataset.kind;

  if (kind === 'market') {
    const m = {
      id: card.dataset.id,
      name: card.dataset.name,
      area: card.dataset.area,
      type: card.dataset.type,
      rating: Number(card.dataset.rating) || 0,
      count: Number(card.dataset.reviews) || 0,
      distanceText: card.dataset.dist || '',
      address: card.dataset.addr || '',
      phone: card.dataset.phone || '',
      hours: card.dataset.hours || '',
    };
    localStorage.setItem('selectedMarket', JSON.stringify(m));
    location.href = buildMarketHref(m);
    return;
  }

  if (kind === 'place') {
    const p = {
      id: card.dataset.place,
      market_id: card.dataset.market,
      name: card.dataset.name,
      rating: Number(card.dataset.rating) || 0,
      reviews: Number(card.dataset.reviews) || 0,
      lat: Number(card.dataset.lat),
      lng: Number(card.dataset.lng),
      photos: [],
    };
    location.href = buildPlaceHref(p);
    return;
  }
});
