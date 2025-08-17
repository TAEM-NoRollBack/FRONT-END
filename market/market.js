// market.js

// ───────────────────────────────────────────────────────────
// 데모 데이터 (연동 전 / research.html에서 ?id= 로 진입 가정)
// ───────────────────────────────────────────────────────────
const DEMO_MARKETS = {
  sinhung: {
    id: "sinhung",
    name: "신흥시장",
    area: "성남",
    type: "전통시장",
    rating: 4.5,
    ratingCount: 8,
    addr: "경기도 성남시 수정구 희망로 343번길 9",
    dist: "현재 위치에서 600m",
    phone: "031-753-8989",
    hours: "월~일 09:00 ~ 20:00",
    notes: "차량 이용시 근처 공영주차장 이용 가능 / 온누리상품권 사용 가능",
    photos: [
      "https://picsum.photos/seed/sinhung1/600/400",
      "https://picsum.photos/seed/sinhung2/600/400",
      "https://picsum.photos/seed/sinhung3/600/400",
      "https://picsum.photos/seed/sinhung4/600/400",
    ],
    hero: [
      "https://picsum.photos/seed/sinhungh1/800/500",
      "https://picsum.photos/seed/sinhungh2/800/500",
    ],

    // ▼ 방문자 리뷰(데모)
    reviews: [
      {
        id: "r1",
        user: "양풍군2",
        avatar: "😀",
        rating: 5,
        likes: 23, // 추천수
        date: "2025-04-23",
        text: "진심보태서… 만족스러웠습니다! 전통시장 특유의 활기...",
        photos: [
          "https://picsum.photos/seed/r1a/600/400",
          "https://picsum.photos/seed/r1b/600/400",
          "https://picsum.photos/seed/r1c/600/400",
          "https://picsum.photos/seed/r1d/600/400",
          "https://picsum.photos/seed/r1e/600/400", // 4장 초과 → +N
          "https://picsum.photos/seed/r1f/600/400",
          "https://picsum.photos/seed/r1g/600/400",
        ],
      },
      {
        id: "r2",
        user: "맛탐정",
        avatar: "🧭",
        rating: 4,
        likes: 12,
        date: "2025-05-01",
        text: "분위기 좋고 상인분들 친절해요. 어묵 강추!",
        photos: [
          "https://picsum.photos/seed/r2a/600/400",
          "https://picsum.photos/seed/r2b/600/400",
        ],
      },
      {
        id: "r3",
        user: "둘기",
        avatar: "🕊️",
        rating: 3.5,
        likes: 5,
        date: "2025-03-11",
        text: "주말엔 좀 붐벼요. 그래도 볼거리 많음.",
        photos: [
          "https://picsum.photos/seed/r3a/600/400",
          "https://picsum.photos/seed/r3b/600/400",
          "https://picsum.photos/seed/r3c/600/400",
          "https://picsum.photos/seed/r3d/600/400",
        ],
      },
    ],
  },
};

// ───────────────────────────────────────────────────────────
// 유틸
// ───────────────────────────────────────────────────────────
function qs(s) {
  return document.querySelector(s);
}
function qsa(s) {
  return [...document.querySelectorAll(s)];
}
function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}
async function loadMarketDetail(id) {
  // 실제 연동 시: return fetch(`/api/markets/${id}`).then(r=>r.json());
  return DEMO_MARKETS[id] || null;
}

// 별 5개 컴포넌트 생성용
const STAR_PATH_D =
  "M7.9996 12.5662L4.12169 14.8593C3.95037 14.9664 3.77127 15.0122 3.58439 14.9969C3.3975 14.9816 3.23397 14.9205 3.09381 14.8135C2.95364 14.7065 2.84462 14.5729 2.76675 14.4126C2.68888 14.2524 2.67331 14.0727 2.72003 13.8733L3.74791 9.53933L0.313855 6.62708C0.158115 6.4895 0.0609338 6.33265 0.0223104 6.15654C-0.016313 5.98043 -0.0047883 5.8086 0.0568846 5.64105C0.118557 5.4735 0.212001 5.33591 0.337216 5.22829C0.46243 5.12066 0.633744 5.05187 0.851156 5.02191L5.38318 4.63208L7.13525 0.550346C7.21312 0.366898 7.33397 0.229311 7.49781 0.137586C7.66165 0.045862 7.82891 0 7.9996 0C8.17029 0 8.33756 0.045862 8.50139 0.137586C8.66523 0.229311 8.78609 0.366898 8.86396 0.550346L10.616 4.63208L15.148 5.02191C15.3661 5.05248 15.5374 5.12128 15.662 5.22829C15.7866 5.3353 15.88 5.47289 15.9423 5.64105C16.0046 5.80921 16.0164 5.98135 15.9778 6.15746C15.9392 6.33357 15.8417 6.49011 15.6853 6.62708L12.2513 9.53933L13.2792 13.8733C13.3259 14.072 13.3103 14.2518 13.2325 14.4126C13.1546 14.5735 13.0456 14.7071 12.9054 14.8135C12.7652 14.9199 12.6017 14.981 12.4148 14.9969C12.2279 15.0128 12.0488 14.967 11.8775 14.8593L7.9996 12.5662Z";
function starSvg() {
  return `<svg viewBox="0 0 16 15"><path d="${STAR_PATH_D}"></path></svg>`;
}
function makeStars(rate, cls = "sm") {
  const five = Array.from({ length: 5 }, starSvg).join("");
  return `
    <div class="stars ${cls}" style="--rate:${rate}">
      <div class="row stars-bg">${five}</div>
      <div class="row stars-fill">${five}</div>
    </div>`;
}

// 날짜 YYYY.MM.DD
function fmtDate(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

// ───────────────────────────────────────────────────────────
function render(detail) {
  if (!detail) return;

  // 헤더/제목
  qs("#title").textContent = detail.name;
  const nameEl = qs("#name");
  nameEl.textContent = detail.name;
  nameEl.dataset.marketId = detail.id;

  // 카테고리
  qs("#chip-area").textContent = detail.area;
  qs("#chip-type").textContent = detail.type;

  // 평점(요약 카드)
  qs("#rating").textContent = detail.rating.toFixed(1);
  qs("#rcount").textContent = `(${detail.ratingCount}명)`;
  const stars = qs("#stars");
  stars.style.setProperty("--rate", detail.rating);

  // 사진/CTA 타이틀에 시장명 반영
  const pt = qs("#photoTitle");
  if (pt) pt.textContent = `${detail.name} 사진`;
  const mf = qs("#moreFoods");
  if (mf) mf.textContent = `${detail.name} 음식 랭킹 더보기`;

  // 히어로 이미지
  if (detail.hero?.[0])
    qs("#hero1").style.backgroundImage = `url('${detail.hero[0]}')`;
  if (detail.hero?.[1])
    qs("#hero2").style.backgroundImage = `url('${detail.hero[1]}')`;

  // 썸네일들
  ["#p1", "#p2", "#p3", "#p4"].forEach((sel, i) => {
    const el = qs(sel);
    if (detail.photos?.[i]) el.style.backgroundImage = `url('${detail.photos[i]}')`;
  });

  // 정보
  qs("#addr").textContent = detail.addr;
  qs("#dist").textContent = detail.dist;
  qs("#phone").textContent = detail.phone;
  qs("#hours").textContent = detail.hours;
  qs("#notes").textContent = detail.notes;

  // ===== 방문자 리뷰 요약/사진 릴 =====
  const reviews = detail.reviews || [];
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
    : 0;

  // 리뷰 헤더 별 5개 삽입 + 평균 반영
  const stars2 = qs("#stars2");
  if (stars2) {
    stars2.querySelector(".stars-bg").innerHTML = Array.from({ length: 5 }, starSvg).join("");
    stars2.querySelector(".stars-fill").innerHTML = Array.from({ length: 5 }, starSvg).join("");
    stars2.style.setProperty("--rate", avg);
  }
  qs("#r2").textContent = avg.toFixed(1);
  qs("#r2c").textContent = `리뷰 ${reviews.length}개`;

  // 방문자 사진 릴(최신순 상위)
  const reel = qs("#ugcReel");
  if (reel) {
    const shots = reviews
      .flatMap((r) => r.photos.map((p) => ({ src: p, date: r.date })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);
    reel.innerHTML = shots
      .map(
        (s) => `
      <div class="reel-item">
        <div class="ph" style="background-image:url('${s.src}')"></div>
        <div class="cap">${fmtDate(s.date)}</div>
      </div>`
      )
      .join("");
  }

  // 기본 정렬: 추천순
  renderReviews(reviews, "recommended");
}

/* 액션 버튼 핸들러 (연동 포인트) */
function wireActions(detail) {
  qsa(".quick-actions .qa").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.action;
      console.log(`[action] ${act}`, detail?.id);
      if (act === "share") {
        navigator.clipboard?.writeText(location.href);
        alert("링크가 복사되었습니다.");
      }
    });
  });

  qs(".btn-back")?.addEventListener("click", () => history.back());
  qs("#btnMap")?.addEventListener("click", () => alert("지도 이동 (연동 예정)"));
  qs("#morePhotos")?.addEventListener("click", () => alert("사진 더보기 (연동 예정)"));
  qs("#moreFoods")?.addEventListener("click", () => alert("음식 랭킹 (연동 예정)"));

  // 모달 닫기
  document.querySelectorAll("#photoModal [data-close]")?.forEach((el) => {
    el.addEventListener("click", closePhotoModal);
  });
}

/* ===== 리뷰 렌더링 / 정렬 ===== */
function sortReviews(list, mode) {
  const arr = [...list];
  if (mode === "new") arr.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (mode === "high")
    arr.sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
  if (mode === "low")
    arr.sort((a, b) => a.rating - b.rating || new Date(b.date) - new Date(a.date));
  if (mode === "recommended")
    arr.sort((a, b) => (b.likes || 0) - (a.likes || 0) || new Date(b.date) - new Date(a.date));
  return arr;
}

function renderReviews(list, mode = "recommended") {
  const wrap = qs("#reviewsList");
  if (!wrap) return;

  const sorted = sortReviews(list, mode);
  wrap.innerHTML = sorted.map((r) => renderReviewItem(r)).join("");

  // +N 클릭 → 모달로 나머지 표시
  wrap.querySelectorAll(".ph.more").forEach((el) => {
    el.addEventListener("click", () => {
      const rid = el.closest(".review")?.dataset.rid;
      const rev = sorted.find((x) => x.id === rid);
      if (!rev) return;
      const rest = rev.photos.slice(4);
      openPhotoModal(rest);
    });
  });
}

function renderReviewItem(r) {
  const show = r.photos?.slice(0, 4) || [];
  const extra = (r.photos?.length || 0) - show.length;

  const pics = show
    .map((src, i) => {
      if (i === 3 && extra > 0) {
        return `<div class="ph more" data-more="+${extra}" style="background-image:url('${src}')"></div>`;
      }
      return `<div class="ph" style="background-image:url('${src}')"></div>`;
    })
    .join("");

  return `
  <article class="review" data-rid="${r.id}">
    <div class="head">
      <div class="avatar">${r.avatar || "🙂"}</div>
      <div class="meta">
        <div class="userline"><b>${r.user}</b> <span class="date">${fmtDate(r.date)}</span></div>
        <div class="rate-row">
          ${makeStars(r.rating, "sm")}
          <span class="muted" style="font-size:12px;">${r.rating.toFixed(1)}</span>
          <span class="muted" style="font-size:12px;">· 추천 ${r.likes || 0}</span>
        </div>
      </div>
      <button class="mini" style="margin-left:auto">•••</button>
    </div>

    <div class="pics4">
      ${pics}
    </div>

    <p class="text">${r.text}</p>
  </article>`;
}

/* ===== 모달 ===== */
function openPhotoModal(images = []) {
  const modal = qs("#photoModal");
  const grid = qs("#modalGrid");
  if (!modal || !grid) return;
  grid.innerHTML = images
    .map((src) => `<div class="ph" style="background-image:url('${src}')"></div>`)
    .join("");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}
function closePhotoModal() {
  const modal = qs("#photoModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

/* ===== 정렬 토글 이벤트 ===== */
function wireReviewFilters(detail) {
  const bar = qs(".filters");
  if (!bar) return;
  const reviews = detail.reviews || [];
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    bar.querySelectorAll(".chip").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    const mode = btn.dataset.sort;
    renderReviews(reviews, mode);
  });
}

// ───────────────────────────────────────────────────────────
// 부트스트랩
// ───────────────────────────────────────────────────────────
(async function init() {
  const id = getParam("id") || "sinhung";
  const detail = await loadMarketDetail(id);
  render(detail);
  wireActions(detail);
  wireReviewFilters(detail);
})();
