// ==============================
// market.js - 방문자 리뷰/사진/정렬/모달 구현
// ==============================

// ------------------------------
// 데모 데이터
// ------------------------------
// --- Saved toggle utils ---
const SAVED_KEY = 'saved.items';

// 요청하신 '저장됨' 아이콘 (분홍 북마크)
const BOOKMARK_ON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 26 32" fill="none">
  <path d="M6.93359 1.5H19.0664C20.3004 1.5 21.1504 1.50062 21.8096 1.5459C22.4572 1.59039 22.8015 1.67303 23.043 1.77637C23.5326 1.98614 23.905 2.28878 24.1484 2.62207L24.2451 2.7666C24.3194 2.88929 24.4005 3.091 24.4482 3.58203C24.4986 4.10025 24.5 4.78068 24.5 5.83008V30.0684C24.5 30.1246 24.4991 30.1779 24.499 30.2285C24.3707 30.1581 24.2189 30.0744 24.0371 29.9727H24.0381L13.7334 24.1963L13 23.7852L12.2666 24.1963L1.96191 29.9707L1.96094 29.9717C1.77973 30.0735 1.628 30.1571 1.5 30.2275V5.83008C1.5 4.78068 1.50142 4.10025 1.55176 3.58203C1.58755 3.21372 1.64282 3.00835 1.69922 2.87695L1.75488 2.7666C1.99077 2.37736 2.39659 2.01516 2.95605 1.77539C3.1975 1.67199 3.54251 1.59041 4.19043 1.5459C4.84961 1.50062 5.69955 1.5 6.93359 1.5Z" fill="#FF83A2" stroke="#FF83A2" stroke-width="3"/>
</svg>`;
const BOOKMARK_OFF_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 26 32" fill="none">
  <path d="M6.93359 1.5H19.0664C20.3004 1.5 21.1504 1.50062 21.8096 1.5459C22.4572 1.59039 22.8015 1.67303 23.043 1.77637C23.5326 1.98614 23.905 2.28878 24.1484 2.62207L24.2451 2.7666C24.3194 2.88929 24.4005 3.091 24.4482 3.58203C24.4986 4.10025 24.5 4.78068 24.5 5.83008V30.0684C24.5 30.1246 24.4991 30.1779 24.499 30.2285C24.3707 30.1581 24.2189 30.0744 24.0371 29.9727H24.0381L13.7334 24.1963L13 23.7852L12.2666 24.1963L1.96191 29.9707L1.96094 29.9717C1.77973 30.0735 1.628 30.1571 1.5 30.2275V5.83008C1.5 4.78068 1.50142 4.10025 1.55176 3.58203C1.58755 3.21372 1.64282 3.00835 1.69922 2.87695L1.75488 2.7666C1.99077 2.37736 2.39659 2.01516 2.95605 1.77539C3.1975 1.67199 3.54251 1.59041 4.19043 1.5459C4.84961 1.50062 5.69955 1.5 6.93359 1.5Z" stroke="#C9C9C9" stroke-width="2" fill="none"/>
</svg>`;
// 저장목록 load/save
function loadSavedList() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}
function saveSavedList(list) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {}
}

// 현재 상세의 저장 payload 만들기
function buildSavedItem(detail, scope) {
  // 대표 이미지(가능하면 1장)
  const thumb =
    (Array.isArray(detail.photos) && detail.photos[0]) ||
    (Array.isArray(detail.hero) && detail.hero[0]) ||
    '';

  return {
    type: scope.type, // 'place' | 'market'
    id: detail.id,
    name: detail.name,
    addr: detail.addr || '',
    lat: detail.lat,
    lng: detail.lng,
    rating: detail.rating || 0,
    ratingCount: detail.ratingCount || 0,
    market_id:
      detail.market_id ||
      (scope.type === 'place'
        ? document.querySelector('#name')?.dataset.marketId || ''
        : ''),
    thumb,
  };
}

// 저장여부 확인
function isSaved(scope) {
  const list = loadSavedList();
  return list.some((it) => it.id === scope.id && it.type === scope.type);
}

// 버튼 UI 반영(아이콘 교체)
// 버튼 UI 반영(아이콘만 교체, 라벨 보존)
function setSaveButtonUI(saved) {
  const btn = document.querySelector(
    '.quick-actions .qa[data-action="save"], .quick-actions .qa.js-save'
  );
  if (!btn) return;

  // 최초 1회: 현재 OFF 상태 SVG 백업 (없으면 기본 OFF 아이콘)
  if (!btn.dataset.svgOff) {
    const svg0 = btn.querySelector('.ico svg') || btn.querySelector('svg');
    btn.dataset.svgOff = svg0 ? svg0.outerHTML : BOOKMARK_OFF_SVG;
  }

  const nextSvg = saved ? BOOKMARK_ON_SVG : btn.dataset.svgOff;
  const ico = btn.querySelector('.ico');

  if (ico) {
    ico.innerHTML = nextSvg;
  } else {
    const firstSvg = btn.querySelector('svg');
    if (firstSvg) {
      firstSvg.insertAdjacentHTML('afterend', nextSvg);
      firstSvg.remove();
    } else {
      btn.insertAdjacentHTML('afterbegin', nextSvg);
    }
  }
  btn.classList.toggle('on', saved);
}

// 토글 실행
function toggleSave(detail, scope) {
  const list = loadSavedList();
  const idx = list.findIndex(
    (it) => it.id === scope.id && it.type === scope.type
  );
  let saved;

  if (idx >= 0) {
    // 이미 저장됨 → 삭제
    list.splice(idx, 1);
    saved = false;
  } else {
    // 미저장 → 추가
    list.unshift(buildSavedItem(detail, scope));
    saved = true;
  }
  saveSavedList(list);
  setSaveButtonUI(saved);
}

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
/* === Me / Author helpers === */
function closeCenteredMenu(wrap) {
  return closeCenteredReviewMenu(wrap);
}

function getMe() {
  // 실제 로그인 연동 전: localStorage 여러 키 대응
  try {
    const raw =
      localStorage.getItem('me') ||
      localStorage.getItem('profile') ||
      localStorage.getItem('auth.user');
    if (raw) {
      const o = JSON.parse(raw);
      return {
        id: String(o.id || o.userId || o.uid || o.memberId || o.loginId || ''),
        name: (o.name || o.nickname || o.username || '').trim(),
      };
    }
  } catch {}
  const name =
    localStorage.getItem('myName') || localStorage.getItem('nickname') || '';
  return { id: '', name: (name || '').trim() };
}

function normalizeStr(s) {
  return (s || '').toString().trim().toLowerCase();
}

function isMyReview(r) {
  const me = getMe();
  const ids = [
    r.user?.id,
    r.userId,
    r.uid,
    r.memberId,
    r.authorId,
    r.author?.id,
    r.writerId,
  ]
    .filter(Boolean)
    .map(String);
  const names = [
    r.user?.name,
    r.author?.name,
    r.nickname,
    r.name,
    r.writer,
    r.authorName,
  ].filter(Boolean);

  if (me.id && ids.some((id) => String(id) === String(me.id))) return true;
  if (me.name && names.some((n) => normalizeStr(n) === normalizeStr(me.name)))
    return true;
  return false;
}

/* 안전한 날짜 포맷 */
function formatKrShort(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const a = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${a}`;
}

/* 별점 DOM (의존성 없이) */
function starsInline(rate = 0, small = false) {
  const cls = small ? 'stars sm' : 'stars';
  const r = Math.max(0, Math.min(5, Number(rate) || 0));
  return `
    <div class="${cls}" style="--rate:${r}" aria-hidden="true">
      <div class="row stars-bg">${starsRowHtml()}</div>
      <div class="row stars-fill">${starsRowHtml()}</div>
    </div>`;
}

/* 삭제 유틸 */
function deleteReview(type, id, rid) {
  const list = loadReviewsFor(type, id);
  const next = list.filter((r) => r.id !== rid);
  saveReviewsFor(type, id, next);
  return next;
}

/* 전역 스코프 보관(렌더/액션에서 사용) */
let CURRENT_SCOPE = null;
let CURRENT_CTX = null;

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

function upsertReview(type, id, review) {
  const list = loadReviewsFor(type, id);

  // 내 정보(없으면 1회 생성해서 저장)
  let me = getMe();
  if (!me.id && !me.name) {
    me = {
      id: 'dev_' + Math.random().toString(36).slice(2, 10),
      name: '내리뷰',
      emoji: '🙂',
    };
    try {
      localStorage.setItem('me', JSON.stringify(me));
    } catch {}
  }

  // 편집이면 id로 교체
  const incomingId = review.id || review.rid;
  if (incomingId) {
    const idx = list.findIndex((r) => r.id === incomingId);
    if (idx >= 0) {
      const prev = list[idx];
      list[idx] = {
        ...prev,
        ...review,
        id: incomingId,
        user: {
          id: review.user?.id || prev.user?.id || me.id,
          name: review.user?.name || prev.user?.name || me.name,
          emoji: review.user?.emoji || prev.user?.emoji || me.emoji || '🙂',
        },
        createdAt:
          prev.createdAt ||
          review.createdAt ||
          new Date().toISOString().slice(0, 10),
        helpful:
          typeof review.helpful === 'number'
            ? review.helpful
            : prev.helpful || 0,
        photos: Array.isArray(review.photos)
          ? review.photos
          : prev.photos || [],
        tags: Array.isArray(review.tags) ? review.tags : prev.tags || [],
      };
      saveReviewsFor(type, id, list);
      return list;
    }
  }

  // 새 글
  const rid = 'r_' + Math.random().toString(36).slice(2, 9);
  const now = new Date();
  const payload = {
    id: rid,
    user: {
      id: review?.user?.id || me.id,
      name: review?.user?.name || me.name || '방문자',
      emoji: review?.user?.emoji || me.emoji || '🙂',
    },
    rating: Number(review?.rating) || 0,
    createdAt: review?.createdAt || now.toISOString().slice(0, 10),
    helpful: Number(review?.helpful) || 0,
    text: review?.text || '',
    photos: Array.isArray(review?.photos) ? review.photos : [],
    tags: Array.isArray(review?.tags) ? review.tags : [],
  };
  list.unshift(payload);
  saveReviewsFor(type, id, list);
  return list;
}
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const getParam = (name) => new URLSearchParams(location.search).get(name);
// helper: URL-safe base64 decode
function unpack(b64) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}
const unpackPx = unpack;
async function loadDetailFromParams() {
  const params = new URLSearchParams(location.search);

  const marketParam = params.get('market') || '';
  const placeParam = params.get('place') || '';
  const idParam = params.get('id') || '';
  const latParam = params.get('lat');
  const lngParam = params.get('lng');
  const pxPayload = unpackPx(params.get('px')) || null;

  const latQ = Number(latParam);
  const lngQ = Number(lngParam);
  const hasQLL = !Number.isNaN(latQ) && !Number.isNaN(lngQ);

  let marketId = marketParam;
  let placeId = placeParam;
  if (!placeId && !marketId && idParam) {
    if (DEMO_PLACES[idParam]) placeId = idParam;
    else if (DEMO_MARKETS[idParam]) marketId = idParam;
  }

  // 1) 데모 place로 진입
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

  // 2) placeId는 있는데 데모에 없음 → px/좌표 기반 가상 가게
  if (placeId) {
    let navCtx = null;
    try {
      const raw = localStorage.getItem('navCtx:' + placeId);
      if (raw) navCtx = JSON.parse(raw);
    } catch {}
    const parent =
      DEMO_MARKETS[marketId] ||
      (pxPayload?.id && DEMO_MARKETS[pxPayload.id]) ||
      DEMO_MARKETS.sinhung;

    const vName =
      pxPayload?.name || params.get('pname') || navCtx?.place?.name || '가게';

    const vLat = hasQLL
      ? latQ
      : typeof pxPayload?.lat === 'number'
      ? pxPayload.lat
      : typeof navCtx?.place?.lat === 'number'
      ? navCtx.place.lat
      : parent.lat;

    const vLng = hasQLL
      ? lngQ
      : typeof pxPayload?.lng === 'number'
      ? pxPayload.lng
      : typeof navCtx?.place?.lng === 'number'
      ? navCtx.place.lng
      : parent.lng;

    const virtual = {
      id: placeId,
      market_id: parent.id,
      name: vName,
      lat: vLat,
      lng: vLng,
      rating: typeof pxPayload?.rating === 'number' ? pxPayload.rating : 0,
      ratingCount:
        typeof pxPayload?.ratingCount === 'number' ? pxPayload.ratingCount : 0,
      addr: pxPayload?.addr || parent.addr || '',
      phone: '',
      hours: pxPayload?.hours || '',
      notes: `소속 시장: ${parent.name}`,
      photos: Array.isArray(pxPayload?.photos) ? pxPayload.photos : [],
      hero: [],
    };

    try {
      localStorage.removeItem('navCtx:' + placeId);
    } catch {}

    return {
      mode: 'place',
      place: virtual,
      parent,
      scope: { type: 'place', id: virtual.id },
    };
  }

  // 3) pname + 좌표 진입(레거시)
  const pname = params.get('pname');
  if (pname && hasQLL) {
    const parent =
      DEMO_MARKETS[marketId] ||
      (pxPayload?.id && DEMO_MARKETS[pxPayload.id]) ||
      DEMO_MARKETS.sinhung;

    const virtual = {
      id:
        'v_' +
        btoa(unescape(encodeURIComponent(pname)))
          .replace(/=+$/, '')
          .slice(0, 10),
      market_id: parent.id,
      name: pname,
      lat: latQ,
      lng: lngQ,
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
  const baseMarket =
    DEMO_MARKETS[marketId] ||
    (pxPayload?.id && DEMO_MARKETS[pxPayload.id]) ||
    DEMO_MARKETS.sinhung;

  const market = hasQLL ? { ...baseMarket, lat: latQ, lng: lngQ } : baseMarket;

  return { mode: 'market', market, scope: { type: 'market', id: market.id } };
}

function loadMarketReviews(marketId) {
  return loadReviewsFor('market', marketId);
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
  mountStars(qs('#stars2'));
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
  const area = document.querySelector('#reviewsList');
  if (!area) return;
  area.innerHTML = '';

  const sorted = sortReviews(list, sortKey);

  // 외부 클릭 시 열린 메뉴 닫기
  const closeAllMenus = () =>
    document
      .querySelectorAll('.review-menu.show')
      .forEach((m) => m.classList.remove('show'));

  document.addEventListener(
    'click',
    (e) => {
      if (
        e.target.closest('.review-menu') ||
        e.target.closest('.btn-meatballs')
      )
        return;
      closeAllMenus();
    },
    { once: true }
  );

  sorted.forEach((r) => {
    const art = document.createElement('article');
    art.className = 'review';

    // 헤드
    const head = document.createElement('div');
    head.className = 'head';
    head.innerHTML = `
      <div class="avatar">${r.user?.emoji || '🙂'}</div>
      <div class="meta">
        <b>${r.user?.name || r.author?.name || r.nickname || '방문자'}</b>
      </div>
      <span class="date">${formatKrShort(r.createdAt)}</span>
    `;

    // … 버튼 (내 리뷰만 보이게)
    const mine = isMyReview(r);
    const kebab = document.createElement('button');
    kebab.className = 'btn-meatballs';
    kebab.setAttribute('aria-label', '리뷰 메뉴');
    kebab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="12" r="2" fill="#C9C9C9"/>
        <circle cx="12" cy="12" r="2" fill="#C9C9C9"/>
        <circle cx="18" cy="12" r="2" fill="#C9C9C9"/>
      </svg>`;
    kebab.style.display = mine ? 'block' : 'none';
    head.appendChild(kebab);

    // 메뉴 시트
    const menu = document.createElement('div');
    menu.className = 'review-menu';
    menu.innerHTML = `
      <div class="menu-group" role="menu">
        <button class="menu-item js-edit"   role="menuitem">수정하기</button>
        <button class="menu-item js-delete" role="menuitem">삭제하기</button>
        <button class="menu-item js-share"  role="menuitem">공유하기</button>
      </div>
      <button class="menu-cancel js-cancel">취소하기</button>
    `;
    head.appendChild(menu);

    // 사진
    const photos = Array.isArray(r.photos) ? r.photos : [];
    if (photos.length) {
      const pics = document.createElement('div');
      pics.className = 'pics4';
      photos.slice(0, 4).forEach((url, i) => {
        const cell = document.createElement('div');
        cell.className = 'ph';
        cell.style.backgroundImage = `url('${url}')`;
        if (i === 3 && photos.length > 4) {
          cell.classList.add('more');
          cell.dataset.more = `+${photos.length - 4}`;
        }
        cell.addEventListener('click', () => openPhotoModal(photos));
        pics.appendChild(cell);
      });
      art.appendChild(head);
      art.appendChild(pics);
    } else {
      art.appendChild(head);
    }

    // 별점/텍스트
    const rateRow = document.createElement('div');
    rateRow.className = 'rate-row';
    rateRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        ${starsInline(r.rating, true)}
      </div>
      ${
        r.tags?.length
          ? `<span class="review-tags">${r.tags.join(' | ')}</span>`
          : ''
      }
    `;
    const txt = document.createElement('p');
    txt.className = 'text';
    txt.textContent = r.text || '';

    art.appendChild(rateRow);
    art.appendChild(txt);
    area.appendChild(art);

    // === 액션 바인딩(내 리뷰만) ===
    if (mine) {
      kebab.addEventListener('click', (e) => {
        e.stopPropagation();
        // 나 말고 열린 메뉴 닫기
        document.querySelectorAll('.review-menu').forEach((m) => {
          if (m !== menu) closeCenteredMenu(m);
        });
        openCenteredMenu(menu); // ✅ 중앙 모달로 열기
      });

      menu
        .querySelector('.js-cancel')
        .addEventListener('click', () => menu.classList.remove('show'));

      menu.querySelector('.js-edit').addEventListener('click', () => {
        const scope = CURRENT_SCOPE || { type: 'place', id: '' };
        const rev = btoa(unescape(encodeURIComponent(JSON.stringify(r)))); // 리뷰 프리필

        const u = new URL('review.html', location.href);
        u.searchParams.set('type', scope.type);
        u.searchParams.set('id', scope.id);
        u.searchParams.set('rid', r.id);
        u.searchParams.set('rev', rev); // ✅ 리뷰 프리필은 rev

        // ✅ 컨텍스트는 그대로 보존해서 전달
        ['px', 'market', 'lat', 'lng', 'pname'].forEach((k) => {
          const v = getParam(k);
          if (v !== null && v !== '') u.searchParams.set(k, v);
        });

        location.href = u.toString();
      });

      menu.querySelector('.js-delete').addEventListener('click', () => {
        const scope = CURRENT_SCOPE || { type: 'place', id: '' };
        if (!confirm('이 리뷰를 삭제할까요?')) return;
        const next = loadReviewsFor(scope.type, scope.id).filter(
          (x) => x.id !== r.id
        );
        saveReviewsFor(scope.type, scope.id, next);
        REVIEWS_RAW = next;

        try {
          if (
            typeof applyReviewAggregateToContext === 'function' &&
            CURRENT_CTX
          ) {
            applyReviewAggregateToContext(CURRENT_CTX);
            if (CURRENT_CTX.mode === 'place')
              renderPlace(CURRENT_CTX.place, CURRENT_CTX.parent);
            else renderMarket(CURRENT_CTX.market);
          }
        } catch {}
        renderReviewHeader(REVIEWS_RAW);
        renderUgcReel(REVIEWS_RAW);
        renderReviews(REVIEWS_RAW, currentSort);
      });

      menu.querySelector('.js-share').addEventListener('click', async () => {
        const url = new URL(location.href);
        url.hash = r.id;
        const link = url.toString();
        try {
          if (navigator.share)
            await navigator.share({ title: '리뷰 공유', url: link });
          else {
            await navigator.clipboard?.writeText(link);
            alert('링크가 복사되었습니다.');
          }
        } catch {}
        menu.classList.remove('show');
      });
    }
  });
}
// --- 중앙 판넬 열기/닫기 유틸 --- //
function openCenteredReviewMenuFrom(btn) {
  closeCenteredReviewMenu(); // 하나만 유지

  const card = btn.closest('.review');
  const srcMenu = card?.querySelector('.review-menu');
  const srcItems = srcMenu ? [...srcMenu.querySelectorAll('.menu-item')] : [];

  const wrap = document.createElement('div');
  wrap.className = 'review-menu centered show';
  wrap.innerHTML = `
    <div class="review-menu-overlay" data-close="1"></div>
    <div class="menu-panel">
      <div class="menu-group">
        <button class="menu-item" data-act="edit">수정하기</button>
        <button class="menu-item" data-act="delete">삭제하기</button>
        <button class="menu-item" data-act="share">공유하기</button>
      </div>
      <button class="menu-cancel" data-close="1">취소하기</button>
    </div>
  `;
  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';

  // 오버레이/취소 클릭 → 닫기
  wrap.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      closeCenteredReviewMenu(wrap);
      return;
    }
    const act = e.target.closest('.menu-item')?.dataset.act;
    if (!act) return;
    const idx = { edit: 0, delete: 1, share: 2 }[act];
    srcItems[idx]?.click(); // 기존 카드 내 로직 재사용
    closeCenteredReviewMenu(wrap); // 닫기
  });

  // ESC로 닫기
  const onEsc = (ev) =>
    ev.key === 'Escape' &&
    (closeCenteredReviewMenu(wrap),
    window.removeEventListener('keydown', onEsc));
  window.addEventListener('keydown', onEsc);
}
// === 호환용 별칭 (legacy 함수명) ===
// 예전 코드: openCenteredMenu(menuEl) → 새 중앙 모달 열기로 위임
function openCenteredMenu(menuEl) {
  const btn = menuEl?.closest('.review')?.querySelector('.btn-meatballs');
  if (btn) openCenteredReviewMenuFrom(btn);
}

// 예전 코드: closeCenteredMenu(any) → 새 닫기 함수로 위임
function closeCenteredMenu(/* any */) {
  return closeCenteredReviewMenu();
}

// 리뷰 리스트 위임 바인딩 (렌더가 다시 되어도 유지)
function wireCenteredReviewMenu() {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-meatballs');
    if (btn) {
      e.preventDefault();
      openCenteredReviewMenuFrom(btn);
    }
  });
}

function closeCenteredReviewMenu(wrap) {
  // 이미 열린 모달이 있으면 닫기
  if (!wrap) wrap = document.querySelector('.review-menu.centered');
  try {
    wrap?.remove();
  } catch {}
  document.body.style.overflow = '';
}

// 리뷰 리스트 위임 바인딩: 새로 렌더되어도 계속 동작
function wireCenteredReviewMenu() {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-meatballs');
    if (btn) {
      e.preventDefault();
      openCenteredReviewMenuFrom(btn);
    }
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
// 저장 버튼(상세 상단 퀵액션) 바인딩 + 초기 UI 동기화
function installSaveToggle(detail, scope) {
  const btn = document.querySelector(
    '.quick-actions .qa[data-action="save"], .quick-actions .qa.js-save'
  );
  if (!btn) return;

  // 현재 저장 여부대로 아이콘 세팅
  setSaveButtonUI(isSaved(scope));

  // 중복 방지 후 클릭 핸들러 연결
  if (btn._saveToggleHandler) {
    btn.removeEventListener('click', btn._saveToggleHandler);
  }
  btn._saveToggleHandler = (e) => {
    e.preventDefault();
    toggleSave(detail, scope); // localStorage 반영
    // setSaveButtonUI는 toggleSave 내부에서 다시 호출됨
  };
  btn.addEventListener('click', btn._saveToggleHandler);
}

// 액션 버튼 핸들러
function wireActions(detail, scope) {
  qsa('.quick-actions .qa').forEach((btn) => {
    const act = btn.dataset.action;
    const isSaveBtn = act === 'save' || btn.classList.contains('js-save');
    if (isSaveBtn) return; // ✅ 저장 버튼은 여기서 핸들러 달지 않음

    btn.addEventListener('click', () => {
      if (act === 'share') {
        navigator.clipboard?.writeText(location.href);
        alert('링크가 복사되었습니다.');
      } else if (act === 'review') {
        const itemName = detail.name;
        const px = getParam('px');
        try {
          localStorage.setItem(
            'navCtx:' + scope.id,
            JSON.stringify({
              type: scope.type,
              place: scope.type === 'place' ? detail : null,
              market: scope.type === 'market' ? detail : null,
              parent: resolveMarketForPlace(detail, null),
            })
          );
        } catch {}
        let reviewUrl = `review.html?type=${scope.type}&id=${
          scope.id
        }&name=${encodeURIComponent(itemName)}`;
        if (px) reviewUrl += `&px=${px}`;
        location.href = reviewUrl;
      } else if (act === 'route') {
        const { name, lat, lng } = detail;
        if (lat && lng) openKakaoMap({ name, lat, lng, mode: 'to' });
        else
          window.open(`https://map.kakao.com/?q=${encodeURIComponent(name)}`);
      }
    });
  });

  qs('.btn-back')?.addEventListener('click', () => {
    window.location.href = '../mainpage/home.html';
  });

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

// === 평균 반영 유틸: 현재 스코프 리뷰로 rating/ratingCount 덮어쓰기 ===
function applyReviewAggregateToContext(ctx) {
  const list = loadReviewsFor(ctx.scope.type, ctx.scope.id);
  if (list.length > 0) {
    const count = list.length;
    const avg = list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count;

    if (ctx.mode === 'market') {
      ctx.market.rating = avg;
      ctx.market.ratingCount = count;
      // 선택: DEMO에 있는 원천도 세션 동안 덮어주기(다른 코드에서 참조할 수 있으니)
      if (DEMO_MARKETS[ctx.market.id]) {
        DEMO_MARKETS[ctx.market.id].rating = avg;
        DEMO_MARKETS[ctx.market.id].ratingCount = count;
      }
    } else {
      ctx.place.rating = avg;
      ctx.place.ratingCount = count;
      if (DEMO_PLACES[ctx.place.id]) {
        DEMO_PLACES[ctx.place.id].rating = avg;
        DEMO_PLACES[ctx.place.id].ratingCount = count;
      }
    }
  }
  return list; // 호출부에서 REVIEWS_RAW로 재사용
}

// === init: 전체 교체 ===
(async function init() {
  // 1) 컨텍스트 로드
  const ctx = await loadDetailFromParams();
  CURRENT_SCOPE = ctx.scope;
  CURRENT_CTX = ctx;
  // 2) 리뷰 전달(작성 후 돌아옴) 처리
  const newReviewRaw = localStorage.getItem('newReview');
  if (newReviewRaw) {
    try {
      const { type, id, payload } = JSON.parse(newReviewRaw);
      if (type === ctx.scope.type && id === ctx.scope.id) {
        upsertReview(type, id, payload); // ← 여기만 변경
      }
    } finally {
      localStorage.removeItem('newReview');
    }
  }

  // 3) ★ 항상 리뷰로 평균 재계산해서 ctx에 주입 (처음 진입/재진입 모두 반영)
  REVIEWS_RAW = applyReviewAggregateToContext(ctx);

  // 4) 렌더
  if (ctx.mode === 'place') renderPlace(ctx.place, ctx.parent);
  else renderMarket(ctx.market);

  // 5) 지도/액션/리뷰 UI
  await renderMapForContext(ctx);
  wireActions(ctx.mode === 'place' ? ctx.place : ctx.market, ctx.scope);
  installSaveToggle(ctx.mode === 'place' ? ctx.place : ctx.market, ctx.scope);
  renderReviewHeader(REVIEWS_RAW);
  renderUgcReel(REVIEWS_RAW);
  renderReviews(REVIEWS_RAW, currentSort);
  wireFilters();
  wireHeaderOpenAll(REVIEWS_RAW);
  wireCenteredReviewMenu();
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

  const name = isPlace ? ctx.place.name : ctx.market.name;
  const kind = ctx.mode; // 'market' 또는 'place'
  const color = kind === 'market' ? '#59F1FF' : '#FF83A2'; // 시장: 하늘색, 가게: 핑크색

  const content = document.createElement('div');
  content.className = `map-label ${kind}`;
  content.innerHTML = `
    <svg class="pin" xmlns="http://www.w3.org/2000/svg" width="19" height="28" viewBox="0 0 19 28" aria-hidden="true" style="color:${color}">
      <path d="M9.5 13.3C9.94556 13.3 10.3868 13.2095 10.7984 13.0336C11.21 12.8577 11.5841 12.5999 11.8991 12.2749C12.2142 11.9499 12.4641 11.564 12.6346 11.1394C12.8051 10.7148 12.8929 10.2596 12.8929 9.8C12.8929 8.87174 12.5354 7.9815 11.8991 7.32513C11.2628 6.66875 10.3998 6.3 9.5 6.3C8.60016 6.3 7.73717 6.66875 7.10089 7.32513C6.4646 7.9815 6.10714 8.87174 6.10714 9.8C6.10714 10.2596 6.1949 10.7148 6.36541 11.1394C6.53591 11.564 6.78583 11.9499 7.10089 12.2749C7.73717 12.9313 8.60016 13.3 9.5 13.3ZM9.5 0C14.7386 0 19 4.382 19 9.8C19 17.15 9.5 28 9.5 28C9.5 28 0 17.15 0 9.8C0 7.20088 1.00089 4.70821 2.78249 2.87035C4.56408 1.0325 6.98044 0 9.5 0Z" fill="currentColor"/>
    </svg>
    <span class="badge">${name}</span>
  `;

  new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(lat, lng),
    content: content,
    yAnchor: 1, // 핀의 뾰족한 끝에 위치하도록 설정
  });
  new kakao.maps.CustomOverlay({
    position: LL(lat, lng),
    content: content,
    yAnchor: 1,
    zIndex: 3,
  }).setMap(map);

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
window.addEventListener('pageshow', (e) => {
  if (e.persisted && CURRENT_CTX) renderMapForContext(CURRENT_CTX);
});
