const SHOP_URL   = '../market/market.html';
// 학교명 동기화 (로컬스토리지에 저장돼 있다면 사용)
(function syncSchool() {
  const labelEl = document.getElementById('schoolLabel');
  const nearbyTitle = document.getElementById('nearbyTitle');
  const school = localStorage.getItem('schoolName') || '을지대';
  if (labelEl) labelEl.textContent = school;
  if (nearbyTitle) nearbyTitle.textContent = `${school} 주변 맛집`;
})();

// 검색 버튼(데모)
document.querySelector('.btn-search')?.addEventListener('click', () => {
  const q = document.getElementById('q')?.value.trim();
  if (!q) return;
  alert(`'${q}' 검색 준비 중입니다 (백엔드 연동 예정).`);
});

// 칩 클릭(데모)
document.querySelectorAll('.chip').forEach(ch =>
  ch.addEventListener('click', () => {
    alert(`필터 '${ch.textContent.trim()}' 적용 (백엔드 연동 예정)`);
  })
);
// ----- 간단한 “프론트 전용 저장소” -----
const STORAGE_KEY = 'nearbyRestaurants';

// 초기 데이터(예시). 최초 1회 저장 후에는 localStorage 값을 사용.
const initialRestaurants = [
  {
    id: 'r1',
    emoji: '🍲',
    category: '추천 맛집',
    name: '김치찜의 정석',
    rating: 4.5,
    ratingCnt: 23,
    badges: [],                        // ['한식 • 중식','도보 6분'] 처럼 넣어도 됨
    desc: '김치찌개가 진하고 깔끔해요. 가까운 시장에서 매일 아침 재료를 공수!',
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

// ----- DOM 유틸 -----
const $list = document.getElementById('nearbyList');

function createStarSvg() {
  // <svg>를 DOM으로 생성 (innerHTML로 넣어도 되지만 DOM 방식이 안전)
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

function createCard(r) {
  const $article = document.createElement('article');
  $article.className = 'card';

  // header
  const $header = document.createElement('header');
  $header.className = 'card-h';

  const $rowLeft = document.createElement('div');
  $rowLeft.className = 'row-left';
  $rowLeft.innerHTML = `
    <span class="cat"><span class="emoji">${r.emoji || '🍽️'}</span> ${r.category || '추천 맛집'}</span>
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

  // 배지(있으면)
  if (r.badges && r.badges.length) {
    const $badges = document.createElement('div');
    $badges.className = 'shop-badges';
    r.badges.forEach((b) => {
      const $b = document.createElement('span');
      $b.className = 'pbadge';
      $b.textContent = b;
      $badges.appendChild($b);
    });
    $article.appendChild($badges);
  }

  // 사진 영역(플레이스홀더 2개)
  const $gallery = document.createElement('div');
  $gallery.className = 'gallery';
  const $ph1 = document.createElement('div');
  const $ph2 = document.createElement('div');
  $ph1.className = 'ph';
  $ph2.className = 'ph';
  $gallery.appendChild($ph1);
  $gallery.appendChild($ph2);
  $article.appendChild($gallery);

  // 설명(있으면)
  if (r.desc) {
    const $desc = document.createElement('p');
    $desc.className = 'desc';
    $desc.textContent = r.desc;
    $article.appendChild($desc);
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

// 페이지 진입 시 렌더
renderRestaurants();

// ----- 전역 API: 콘솔/임시 버튼으로 추가할 수 있게 열어두기 -----
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

// 필요 시 리스트 초기화(테스트용)
window.resetRestaurants = function resetRestaurants() {
  restaurants = [...initialRestaurants];
  saveRestaurants(restaurants);
  renderRestaurants();
};

// chips 클릭 → research.html로 이동 (AI/상세검색 제외)
window.addEventListener('DOMContentLoaded', () => {
  const goResearch = (keyword) => {
    const url = new URL('research.html', location.href); // ../ 말고 동일 폴더 기준
    url.searchParams.set('keyword', keyword);
    location.href = url.toString();
  };

  document
    .querySelectorAll('.chips-row .chip:not(.chip--icon)')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const keyword = btn.textContent.trim();
        goResearch(keyword);
      });
    });
});
(function () {
  // === 경로 상수(홈이 /mainpage 안에 있으므로 market 폴더는 한 단계 위) ===
  const MARKET_URL = '../market/market.html';
  const FOODS_URL  = '../market/market.html';

  // === 0) 오류 메시지 유틸 ===
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

  // === 1) 카카오 SDK 로더 ===
  const KAKAO_JS_KEY =
  localStorage.getItem('kakao.appkey') || 'e771162067cb5bea30a5efc4c5a69160';
  const SDK =
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&autoload=false`;

  function loadKakao() {
    return new Promise((res, rej) => {
      if (window.kakao?.maps) return res();
  
      const s = document.createElement('script');
      s.src = SDK;
      s.async = true;
  
      // ★ 이벤트 객체 그대로 던지지 말고 명확한 에러로
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
    coords.forEach(c => b.extend(LL(c.lat, c.lng)));
    map.setBounds(b, 20, 20, 20, 20);
  }

  // === 2) 학교값 읽기(둘 다 지원: onboarding.school | schoolName) ===
  function getSavedSchoolRaw() {
    const a = localStorage.getItem('onboarding.school');
    const b = localStorage.getItem('schoolName');
    const v = a || b;
    if (!v) return null;
    try { return JSON.parse(v); } catch { return v; } // 문자열/JSON 모두 대응
  }

  // === 3) 학교 → 좌표 매핑(필요 시 추가) ===
  function resolveSchool(s) {
    const list = [
      { id: 'eulji',  name: '을지대',    lat: 37.4597, lng: 127.1652 },
      { id: 'gachon', name: '가천대학교', lat: 37.4523, lng: 127.1290 },
      { id: 'seongnam', name:'성남시청',  lat: 37.4200, lng: 127.1265 },
    ];
    if (!s) return list[0];
    const key = String(s).trim();
    return (
      list.find(x => x.id === key || x.name === key) ||
      list.find(x => key.includes(x.name)) ||
      list[0]
    );
  }

  // === 4) 데모 데이터(나중엔 API로 교체) ===
  const MARKETS = [
    { id: 'sinhung', name: '신흥시장', lat: 37.4419, lng: 127.1295 },
    { id: 'moran',   name: '모란시장', lat: 37.4328, lng: 127.1290 },
  ];
  const PLACES = [
    { id:'p1', market_id:'sinhung', name:'진선보쌈',           lat:37.4426, lng:127.1303, rating:4.5 },
    { id:'p2', market_id:'sinhung', name:'한촌설렁탕 성남점',   lat:37.4413, lng:127.1269, rating:4.2 },
    { id:'p3', market_id:'moran',   name:'칼국수집',           lat:37.4335, lng:127.1276, rating:4.6 },
  ];

  // === 5) 부트스트랩 ===
  document.addEventListener('DOMContentLoaded', async () => {
    const box = document.getElementById('mapBox');
    if (!box) return;

    // 지도 DOM
    box.querySelector('.map-preview')?.remove();
    const mapDiv = document.createElement('div');
    mapDiv.className = 'map';
    box.appendChild(mapDiv);

    // SDK 로딩
    try {
      await loadKakao();
    } catch (e) {
      // 네가 만든 showMapError 같은 함수에 메시지 넘겨
      showMapError(`카카오 SDK 로드 실패: ${e.message}`);
      return;
    }

    // 중심 = 학교
    const school = resolveSchool(getSavedSchoolRaw());
    const center = { lat: school.lat, lng: school.lng };

    // 지도 생성
    const map = new kakao.maps.Map(mapDiv, {
      center: LL(center.lat, center.lng),
      level: 4,
    });
    function addLabelOverlay({ lat, lng, href, name, kind = 'place' }) {
      // 라벨 DOM 구성: [SVG 핀] [배지(텍스트)]
      const a = document.createElement('a');
      a.className = `map-label ${kind === 'market' ? 'market' : 'place'}`;
      a.href = href;
    
      a.innerHTML = `
        <svg class="pin" xmlns="http://www.w3.org/2000/svg" width="19" height="28" viewBox="0 0 19 28" aria-hidden="true">
          <path d="M9.5 13.3C9.94556 13.3 10.3868 13.2095 10.7984 13.0336C11.21 12.8577 11.5841 12.5999 11.8991 12.2749C12.2142 11.9499 12.4641 11.564 12.6346 11.1394C12.8051 10.7148 12.8929 10.2596 12.8929 9.8C12.8929 8.87174 12.5354 7.9815 11.8991 7.32513C11.2628 6.66875 10.3998 6.3 9.5 6.3C8.60016 6.3 7.73717 6.66875 7.10089 7.32513C6.4646 7.9815 6.10714 8.87174 6.10714 9.8C6.10714 10.2596 6.1949 10.7148 6.36541 11.1394C6.53591 11.564 6.78583 11.9499 7.10089 12.2749C7.73717 12.9313 8.60016 13.3 9.5 13.3ZM9.5 0C14.7386 0 19 4.382 19 9.8C19 17.15 9.5 28 9.5 28C9.5 28 0 17.15 0 9.8C0 7.20088 1.00089 4.70821 2.78249 2.87035C4.56408 1.0325 6.98044 0 9.5 0Z" fill="#FF83A2"/>
        </svg>
        <span class="badge">${name}</span>
      `;
    
      // Kakao CustomOverlay
      const ov = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: a,              // DOM 노드 그대로 사용
        yAnchor: 1,              // 좌표 = 요소의 ‘아래쪽’ (핀 꼭지점)
        xAnchor: 0,              // 좌표 = 요소의 ‘왼쪽’ 기준
        clickable: true,
        zIndex: kind === 'market' ? 3 : 2,
      });
    
      ov.setMap(map);
      return ov;
    }
  
    // 마커들
    const coords = [];
    // 시장
    MARKETS.forEach(m => {
      const marker = new kakao.maps.Marker({ map, position: LL(m.lat, m.lng) });
      const iw = new kakao.maps.InfoWindow({
        content: `<div style="padding:4px 6px;font-size:12px">${m.name}</div>`
      });
      kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker));
      kakao.maps.event.addListener(marker, 'mouseout',  () => iw.close());
      kakao.maps.event.addListener(marker, 'click',     () => {
        location.href = `${MARKET_URL}?id=${m.id}`;
      });
      coords.push({ lat: m.lat, lng: m.lng });
    });

    // 맛집(시장 상세/랭킹으로)
    PLACES.forEach(p => {
      addLabelOverlay({
        lat: p.lat, lng: p.lng,
        href: `${SHOP_URL}?id=${p.id}`,
        name: p.name,
        rating: p.rating,
        kind: 'place',
      });
      coords.push({ lat: p.lat, lng: p.lng });
    });

    fitBounds(map, coords.length ? coords : [center]);
  });
})();
// home.js의 kakao.maps.Map 생성 직후에
Object.assign(locBtn.style, {position:'absolute',right:'8px',top:'8px',zIndex:5});
document.getElementById('mapBox').appendChild(locBtn);

locBtn.onclick = () => {
  if (!navigator.geolocation) return alert('GPS를 지원하지 않아요');
  navigator.geolocation.getCurrentPosition(({coords}) => {
    const here = new kakao.maps.LatLng(coords.latitude, coords.longitude);
    map.setCenter(here);
    new kakao.maps.Marker({ map, position: here });
  }, () => alert('현재 위치를 가져오지 못했어요.'));
};
