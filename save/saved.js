/* saved.js */

// --- utils ---
const KEY = 'saved.items';
const MARKET_URL = '../market/market.html';
// 저장목록 로드 유틸 (market.js와 동일 키 사용)
const SAVED_KEY = 'saved.items';
function loadSavedList() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

// 실제 목록을 그리는 함수(너의 렌더러로 교체)
function renderSaved() {
  const list = loadSavedList();
  // TODO: list를 이용해 그리드/리스트 다시 그리기
  // ex) buildSavedGrid(list) 같은 기존 함수가 있으면 그걸 호출
  if (typeof buildSavedGrid === 'function') buildSavedGrid(list);
}

// 최초 진입
document.addEventListener('DOMContentLoaded', renderSaved);

// 뒤로가기(BFCache 복원 포함) 시 재렌더
window.addEventListener('pageshow', (e) => {
  if (
    e.persisted ||
    performance.getEntriesByType('navigation')[0]?.type === 'back_forward'
  ) {
    renderSaved();
  } else {
    // 일반 새로고침·재진입도 항상 동기화
    renderSaved();
  }
});

// 다른 탭/창에서 저장목록이 바뀐 경우에도 동기화
window.addEventListener('storage', (ev) => {
  if (ev.key === SAVED_KEY) renderSaved();
});

function pack(obj) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return '';
  }
}
function haversineMeters(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== 'number')) return NaN;
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
  if (!isFinite(m)) return '';
  return m >= 1000
    ? (m / 1000).toFixed(m < 10000 ? 1 : 0) + 'km'
    : Math.round(m) + 'm';
}

function buildDetailHref(item) {
  const u = new URL(MARKET_URL, location.href);
  if (item.type === 'place') {
    u.searchParams.set('place', item.id);
    if (item.market_id) u.searchParams.set('market', item.market_id);
  } else {
    u.searchParams.set('market', item.id);
  }
  if (typeof item.lat === 'number' && typeof item.lng === 'number') {
    u.searchParams.set('lat', item.lat);
    u.searchParams.set('lng', item.lng);
  }
  // 상세 진입 시 복구용 안전망
  u.searchParams.set(
    'px',
    pack({
      name: item.name,
      addr: item.addr,
      lat: item.lat,
      lng: item.lng,
      rating: item.rating,
      ratingCount: item.ratingCount,
      photos: item.thumb ? [item.thumb] : [],
    })
  );
  return u.toString();
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function render(list, myPos) {
  const empty = document.getElementById('emptyBox');
  const wrap = document.getElementById('savedList');
  if (!wrap) return;

  if (!list.length) {
    empty?.removeAttribute('hidden');
    wrap.setAttribute('hidden', '');
    return;
  }
  empty?.setAttribute('hidden', '');
  wrap.removeAttribute('hidden');

  wrap.innerHTML = '';
  list.forEach((it, idx) => {
    const distM = myPos
      ? haversineMeters(myPos.lat, myPos.lng, it.lat, it.lng)
      : NaN;
    const distText = isFinite(distM) ? `현재위치에서 ${fmtMeters(distM)}` : '';

    const art = document.createElement('article');
    art.className = 'saved-row';
    art.innerHTML = `
      <div class="thumb" style="${
        it.thumb ? `background-image:url('${it.thumb}')` : ''
      }"></div>
      <div class="meta">
        <div class="name">${it.name || '-'}</div>
        <div class="addr">${it.addr || ''}</div>
        ${distText ? `<div class="distchip"> ${distText}</div>` : ''}
      </div>
    `;
    art.addEventListener('click', () => (location.href = buildDetailHref(it)));
    wrap.appendChild(art);

    // 구분선
    if (idx !== list.length - 1) {
      const sep = document.createElement('div');
      sep.className = 'saved-sep';
      wrap.appendChild(sep);
    }
  });
}

function getMyPosition(timeoutMs = 4000) {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    const done = (p) =>
      res(p ? { lat: p.coords.latitude, lng: p.coords.longitude } : null);
    const id = setTimeout(() => done(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(id);
        done(pos);
      },
      () => {
        clearTimeout(id);
        done(null);
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}

// back/close
document.addEventListener('DOMContentLoaded', async () => {
  document
    .querySelector('.btn-back')
    ?.addEventListener('click', () => history.back());
  document
    .querySelector('.btn-close')
    ?.addEventListener(
      'click',
      () => (location.href = '../mainpage/home.html')
    );

  const list = loadSaved();
  render(list, null); // 1차 렌더(거리 없이)
  const pos = await getMyPosition();
  if (pos) render(list, pos); // 위치 들어오면 거리 갱신
});
// 다른 탭에서 저장목록이 바뀌면 자동 리렌더
window.addEventListener('storage', async (e) => {
  if (e.key !== KEY) return;
  const list = loadSaved();
  const pos = await getMyPosition();
  render(list, pos || null);
});
window.addEventListener('pageshow', async () => {
  const list = loadSaved();
  render(list, null);
  const pos = await getMyPosition();
  if (pos) render(list, pos);
});
