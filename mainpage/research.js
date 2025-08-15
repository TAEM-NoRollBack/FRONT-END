// 읽어온 키워드로 입력 채우기 + X 버튼으로 지우기
const $kw = document.getElementById('kw');
const $clear = document.getElementById('kwClear');

const params = new URLSearchParams(location.search);
const initialKeyword = params.get('keyword') || '';
$kw.value = initialKeyword;

const syncClearBtn = () => {
  $clear.style.visibility = $kw.value ? 'visible' : 'hidden';
};
syncClearBtn();

$kw.addEventListener('input', syncClearBtn);

$clear.addEventListener('click', () => {
  $kw.value = '';
  syncClearBtn();
  $kw.focus();
  // URL에서 keyword 제거 (뒤로가기 히스토리 오염 방지)
  const url = new URL(location.href);
  url.searchParams.delete('keyword');
  history.replaceState({}, '', url);
});

// 데모 데이터 (백엔드 연동 전)
const demo = [
  {
    name: '신흥시장',
    rating: 4.5, count: 8,
    distance: '현재위치에서 600m', open: '영업중',
    desc: '“프랜차이즈보다 싸고 맛있는 먹거리 천국! 순대, 꽈배기, 돈까스가 특히 맛있었어요!”'
  },
  {
    name: '금광시장',
    rating: 4.0, count: 23,
    distance: '현재위치에서 800m', open: '영업중',
    desc: '“과일과 사과 귤값 정말 훌륭. 전통시장 특유의 활기가 참 좋더라고요.”'
  }
];

// 카드 렌더링
const $list = document.getElementById('resultList');
const starSvg = `
<svg class="r-star" viewBox="0 0 16 15" aria-hidden="true">
  <path d="M7.9996 12.5662L4.12169 14.8593C3.95037 14.9664 3.77127 15.0122 3.58439 14.9969C3.3975 14.9816 3.23397 14.9205 3.09381 14.8135C2.95364 14.7065 2.84462 14.5729 2.76675 14.4126C2.68888 14.2524 2.67331 14.0727 2.72003 13.8733L3.74791 9.53933L0.313855 6.62708C0.158115 6.4895 0.0609338 6.33265 0.0223104 6.15654C-0.016313 5.98043 -0.0047883 5.8086 0.0568846 5.64105C0.118557 5.4735 0.212001 5.33591 0.337216 5.22829C0.46243 5.12066 0.633744 5.05187 0.851156 5.02191L5.38318 4.63208L7.13525 0.550346C7.21312 0.366898 7.33397 0.229311 7.49781 0.137586C7.66165 0.045862 7.82891 0 7.9996 0C8.17029 0 8.33756 0.045862 8.50139 0.137586C8.66523 0.229311 8.78609 0.366898 8.86396 0.550346L10.616 4.63208L15.148 5.02191C15.3661 5.05248 15.5374 5.12128 15.662 5.22829C15.7866 5.3353 15.88 5.47289 15.9423 5.64105C16.0046 5.80921 16.0164 5.98135 15.9778 6.15746C15.9392 6.33357 15.8417 6.49011 15.6853 6.62708L12.2513 9.53933L13.2792 13.8733C13.3259 14.072 13.3103 14.2518 13.2325 14.4126C13.1546 14.5735 13.0456 14.7071 12.9054 14.8135C12.7652 14.9199 12.6017 14.981 12.4148 14.9969C12.2279 15.0128 12.0488 14.967 11.8775 14.8593L7.9996 12.5662Z" fill="#FF83A2"/>
</svg>`;

$list.innerHTML = demo.map((d, i) => `
  <article class="r-card">
    <header class="r-head">
      <div class="r-left">
        <span class="r-index">${i+1}.</span>
        <span class="r-title">${d.name}</span>
      </div>
      <div class="r-rate">
        ${starSvg}
        <span>${d.rating.toFixed(1)} (${d.count}명)</span>
      </div>
    </header>

    <div class="r-tags">
      <span class="tag pin">${d.distance}</span>
      <span class="tag">${d.open}</span>
    </div>

    <div class="r-photos">
      <div class="ph"></div>
      <div class="ph"></div>
    </div>

    <p class="r-desc">${d.desc}</p>
  </article>
`).join('');
