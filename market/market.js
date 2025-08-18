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
    lat: 37.4419, // 대충 신흥시장 부근 좌표 예시
    lng: 127.1295,
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

// 방문자 리뷰 데모
const DEMO_REVIEWS = [
  {
    id: 'r1',
    user: { name: '양풍군2', emoji: '😀' },
    rating: 4.5,
    createdAt: '2025-04-23',
    helpful: 21,
    text: '진선보쌈에서의 한 끼, 정말 만족스러웠습니다! 부드럽고 촉촉하게 찐 보쌈 고기...',
    photos: [
      'https://picsum.photos/seed/rv1a/640/480',
      'https://picsum.photos/seed/rv1b/640/480',
      'https://picsum.photos/seed/rv1c/640/480',
      'https://picsum.photos/seed/rv1d/640/480',
      'https://picsum.photos/seed/rv1e/640/480',
      'https://picsum.photos/seed/rv1f/640/480',
    ],
  },
  {
    id: 'r2',
    user: { name: '시장탐방러', emoji: '🧑‍🍳' },
    rating: 5.0,
    createdAt: '2025-02-11',
    helpful: 8,
    text: '칼국수 국물 미쳤습니다. 손칼국수에 김치 한 점이면 말이 필요 없어요. 사장님 너무 친절!',
    photos: [
      'https://picsum.photos/seed/rv2a/640/480',
      'https://picsum.photos/seed/rv2b/640/480',
    ],
  },
  {
    id: 'r3',
    user: { name: '먹로드', emoji: '🍜' },
    rating: 4.0,
    createdAt: '2025-08-03',
    helpful: 5,
    text: '만두 맛집 인정. 웨이팅 있어도 금방 빠집니다. 다만 주말엔 꽤 붐벼요.',
    photos: ['https://picsum.photos/seed/rv3a/640/480'],
  },
  {
    id: 'r4',
    user: { name: '달려라만쥬', emoji: '🥟' },
    rating: 3.5,
    createdAt: '2025-04-16',
    helpful: 3,
    text: '전체적으로 만족하지만 주차가 살짝 불편했어요. 그래도 가격 착하고 든든!',
    photos: [
      'https://picsum.photos/seed/rv4a/640/480',
      'https://picsum.photos/seed/rv4b/640/480',
      'https://picsum.photos/seed/rv4c/640/480',
      'https://picsum.photos/seed/rv4d/640/480',
      'https://picsum.photos/seed/rv4e/640/480',
      'https://picsum.photos/seed/rv4f/640/480',
      'https://picsum.photos/seed/rv4g/640/480',
    ],
  },
];

// ------------------------------
// 유틸
// ------------------------------
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const getParam = (name) => new URLSearchParams(location.search).get(name);

async function loadMarketDetail(id) {
  return DEMO_MARKETS[id] || null;
}
async function loadMarketReviews(/* marketId */) {
  return DEMO_REVIEWS.slice().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
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
function render(detail) {
  if (!detail) return;

  qs('#title').textContent = detail.name;
  const nameEl = qs('#name');
  nameEl.textContent = detail.name;
  nameEl.dataset.marketId = detail.id;

  qs('#chip-area').textContent = detail.area;
  qs('#chip-type').textContent = detail.type;

  qs('#rating').textContent = detail.rating.toFixed(1);
  qs('#rcount').textContent = `(${detail.ratingCount}명)`;
  qs('#stars').style.setProperty('--rate', detail.rating);

  qs('#photoTitle').textContent = `${detail.name} 사진`;
  qs('#moreFoods').textContent = `${detail.name} 음식 랭킹 더보기`;

  if (detail.hero?.[0])
    qs('#hero1').style.backgroundImage = `url('${detail.hero[0]}')`;
  if (detail.hero?.[1])
    qs('#hero2').style.backgroundImage = `url('${detail.hero[1]}')`;

  ['#p1', '#p2', '#p3', '#p4'].forEach((sel, i) => {
    const el = qs(sel);
    if (detail.photos?.[i])
      el.style.backgroundImage = `url('${detail.photos[i]}')`;
  });

  qs('#addr').textContent = detail.addr;
  qs('#dist').textContent = detail.dist;
  qs('#phone').textContent = detail.phone;
  qs('#hours').textContent = detail.hours;
  qs('#notes').textContent = detail.notes;
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
      <div style="margin-left:auto"></div>
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
    rateRow.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        ${starsHtml(r.rating, true)}
        <b style="font-size:12px;">${(r.rating || 0).toFixed(1)}</b>
      </div>
      <span class="date">${formatKrShort(r.createdAt)}</span>
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
function wireActions(detail) {
  qsa('.quick-actions .qa').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      if (act === 'share') {
        navigator.clipboard?.writeText(location.href);
        alert('링크가 복사되었습니다.');
      } else if (act === 'review') {
        alert('리뷰 작성 화면으로 이동 (연동 예정)');
      } else if (act === 'save') {
        alert('저장 처리 (연동 예정)');
      } else if (act === 'route') {
        alert('길찾기 (연동 예정)');
      }
    });
  });

  qs('.btn-back')?.addEventListener('click', () => history.back());
  qs('#btnMap')?.addEventListener('click', () =>
    alert('지도 이동 (연동 예정)')
  );
  qs('#morePhotos')?.addEventListener('click', () => {
    const id = qs('#name')?.dataset.marketId || getParam('id') || 'sinhung';
    location.href = `photo.html?id=${encodeURIComponent(id)}`;
  });
  qs('#moreFoods')?.addEventListener('click', () => {
    const id = qs('#name')?.dataset.marketId || getParam('id') || 'sinhung';
    const lat = (DEMO_MARKETS[id] && DEMO_MARKETS[id].lat) ? DEMO_MARKETS[id].lat : 37.4419;
    const lng = (DEMO_MARKETS[id] && DEMO_MARKETS[id].lng) ? DEMO_MARKETS[id].lng : 127.1295;
    location.href = `foods.html?id=${encodeURIComponent(id)}&lat=${lat}&lng=${lng}`;
  });
}

// ------------------------------
// 부트스트랩
// ------------------------------
(async function init() {
  const id = getParam('id') || 'sinhung';
  const detail = await loadMarketDetail(id);
  render(detail);
  wireActions(detail);

  REVIEWS_RAW = await loadMarketReviews(id);
  renderReviewHeader(REVIEWS_RAW);
  renderUgcReel(REVIEWS_RAW);
  renderReviews(REVIEWS_RAW, currentSort);
  wireFilters();
  wireHeaderOpenAll(REVIEWS_RAW);
})();
