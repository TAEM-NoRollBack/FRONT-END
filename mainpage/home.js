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
