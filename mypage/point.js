// ===== Config =====
const USE_MOCK = true; // 백엔드 붙이면 false로
const ENDPOINT = '/api/points'; // 예시: GET { balance, history[] }
// ✅ 추가
const POINTS_KEY = 'points.state.v1';

// ✅ 추가: 로컬 포인트 상태 로드/저장 + 초기화(없으면 MOCK으로 시드)
function loadPointsState() {
	try {
		const s = JSON.parse(localStorage.getItem(POINTS_KEY));
		if (s && typeof s === 'object') return s;
	} catch {}
	const seeded = structuredClone(MOCK); // 처음엔 더미로 시드
	localStorage.setItem(POINTS_KEY, JSON.stringify(seeded));
	return seeded;
}
function savePointsState(state) {
	localStorage.setItem(POINTS_KEY, JSON.stringify(state));
}
// ===== Utils =====
const $ = (sel, el = document) => el.querySelector(sel);
const fmtDate = (iso) => {
	// "2025-07-17" -> "07.17"
	const d = new Date(iso.replace(/-/g, '/')); // iOS 파싱 대응
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${mm}.${dd}`;
};
const fmtExpire = (iso) => `${iso.replace(/-/g, '.')} 까지 사용 가능`;
const numberWithComma = (n) => n.toLocaleString('ko-KR');

// ===== API =====
async function getPoints() {
	if (USE_MOCK) {
		// ✅ 로컬 스토리지에서 읽음(최초 1회는 MOCK으로 시드)
		return loadPointsState();
	}
	// 백엔드 붙이면 여기 사용
	const res = await fetch(ENDPOINT, { credentials: 'include' });
	if (!res.ok) throw new Error('Failed to load');
	return res.json();
}

// ===== Render =====
function renderBalance(balance) {
	$('#balance').textContent = numberWithComma(balance);
}

function renderHistory(list) {
	const wrap = document.querySelector('#txList');
	wrap.setAttribute('aria-busy', 'true');
	wrap.innerHTML = list
		.map(
			(tx) => `
    <article class="tx">
      <div class="meta">
        <div class="row">
          <span class="date">${fmtDate(tx.date)}</span>
          <span class="text">${tx.title}</span>
        </div>
        <div class="expire">${fmtExpire(tx.expire)}</div>
      </div>
      <div class="amt">
        <span class="amount">+ ${numberWithComma(tx.amount)}P</span>
        <span class="tag">적립</span>
      </div>
    </article>
  `
		)
		.join('');
	wrap.setAttribute('aria-busy', 'false');
}

// ===== Init =====
(async function init() {
	try {
		const data = await getPoints();
		renderBalance(data.balance || 0);
		renderHistory(Array.isArray(data.history) ? data.history : []);
	} catch (e) {
		console.error(e);
		renderBalance(0);
		renderHistory([]);
	}
})();
