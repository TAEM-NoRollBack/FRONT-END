// ===== Config =====
const USE_MOCK = true; // 백엔드 붙이면 false로
const ENDPOINT = '/api/points'; // 예시: GET { balance, history[] }

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

// ===== Mock Data =====
const MOCK = {
  balance: 3000,
  history: [
    {
      id: 1,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 2,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 3,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 4,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 5,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 6,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
    {
      id: 7,
      date: '2025-07-17',
      title: '신흥시장 블로그 리뷰 작성',
      expire: '2025-12-31',
      amount: +200,
    },
  ],
};

// ===== API =====
async function getPoints() {
  if (USE_MOCK) return structuredClone(MOCK);
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
