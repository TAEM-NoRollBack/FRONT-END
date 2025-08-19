const params = new URLSearchParams(location.search);
const reviewType = params.get('type');
const reviewId = params.get('id');
const reviewName = decodeURIComponent(params.get('name') || '리뷰');
// 타이틀 버튼
const titleElement = document.querySelector('.page-title strong');
if (titleElement) {
  titleElement.textContent = reviewName;
}
document
  .querySelector('.btn-back')
  ?.addEventListener('click', () => history.back());
document.querySelector('.btn-close')?.addEventListener('click', () => {
  if (window.close) window.close();
  else history.back();
});
console.log('review.js loaded');
// 별점: 클릭 시 채워짐
const starWrap = document.getElementById('stars');
const ratingInput = document.getElementById('rating');
starWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('.star');
  if (!btn) return;
  const val = Number(btn.dataset.value);
  ratingInput.value = val;
  [...starWrap.querySelectorAll('.star')].forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.value) <= val);
  });
  syncSubmit();
});

// 칩 선택
function setupChips(root) {
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const single = root.dataset.type === 'single';
    if (single) {
      [...root.querySelectorAll('.chip')].forEach(
        (c) => (c.dataset.selected = 'false')
      );
      chip.dataset.selected = 'true';
    } else {
      chip.dataset.selected =
        chip.dataset.selected === 'true' ? 'false' : 'true';
    }
    syncSubmit();
  });
}
setupChips(document.getElementById('useType'));
setupChips(document.getElementById('waitTime'));
setupChips(document.getElementById('purposes'));

// 업로드
// 업로드
// 업로드
const uploadBox = document.getElementById('uploadBox');
const inputFile = document.getElementById('file');
const thumbs = document.getElementById('thumbs');

uploadBox.addEventListener('click', () => inputFile.click());

inputFile.addEventListener('change', () => {
  thumbs.innerHTML = '';
  const files = [...inputFile.files];
  const maxThumbs = 3;
  const remaining = Math.max(0, files.length - maxThumbs);

  files.slice(0, maxThumbs).forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    wrap.innerHTML = `
      ${
        file.type.startsWith('video')
          ? `<video src="${url}" muted></video>`
          : `<img src="${url}" alt="미디어 미리보기">`
      }
      <button type="button" class="del" aria-label="삭제">×</button>
      ${
        index === 0
          ? `<button type="button" class="add-more" aria-label="사진 추가">+</button>`
          : ''
      }
      ${
        index === maxThumbs - 1 && remaining > 0
          ? `<div class="remaining">+${remaining}</div>`
          : ''
      }
    `;

    const delButton = wrap.querySelector('.del');
    delButton.addEventListener('click', () => {
      const updatedFiles = [...inputFile.files];
      updatedFiles.splice(files.indexOf(file), 1);
      const dt = new DataTransfer();
      updatedFiles.forEach((f) => dt.items.add(f));
      inputFile.files = dt.files;
      inputFile.dispatchEvent(new Event('change'));
    });

    const addMoreButton = wrap.querySelector('.add-more');
    if (addMoreButton) {
      addMoreButton.addEventListener('click', () => inputFile.click());
    }

    thumbs.appendChild(wrap);
  });

  uploadBox.style.display = files.length > 0 ? 'none' : 'flex';
  syncSubmit();
});
// 글자수 & 제출 가능
const memo = document.getElementById('memo');
const count = document.getElementById('count');
const btnSubmit = document.getElementById('btnSubmit');

memo.addEventListener('input', () => {
  count.textContent = memo.value.length;
  syncSubmit();
});

function syncSubmit() {
  const ready =
    Number(ratingInput.value) > 0 ||
    memo.value.trim().length > 0 ||
    inputFile.files.length > 0;
  btnSubmit.disabled = !ready;
}

// 제출(Mock)
// 기존 document.getElementById('reviewForm').addEventListener(...) 부분을
// 아래 코드로 전체 교체하세요.

// 파일(이미지)을 Base64 데이터 URL로 읽는 헬퍼 함수
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 제출
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 사진 파일들을 DataURL로 변환 (localStorage에 저장 가능하도록)
  const photoPromises = [...inputFile.files].map(readFileAsDataURL);
  const photoDataUrls = await Promise.all(photoPromises);

  // 제출할 전체 데이터 구성
  const payload = {
    rating: Number(ratingInput.value),
    text: memo.value.trim(),
    photos: photoDataUrls,
    tags: [
      pickSingle('useType'),
      `대기시간:${pickSingle('waitTime')}`,
      ...pickMulti('purposes'),
    ].filter(Boolean), // 빈 태그는 제외
  };

  // localStorage에 임시 저장
  localStorage.setItem(
    'newReview',
    JSON.stringify({
      type: reviewType,
      id: reviewId,
      payload: payload,
    })
  );

  // 원래의 상세 페이지로 돌아가기
  // market.html?id=sinhung 또는 market.html?place=p1 과 같은 형태로 복귀
  const targetUrl = new URL(
    'market.html',
    location.origin + location.pathname.replace('review.html', '')
  );
  targetUrl.searchParams.set(reviewType, reviewId);
  location.href = targetUrl.toString();
  const px = params.get('px');
  // px 파라미터가 있었다면, 돌아갈 URL에도 똑같이 추가해줍니다.
  if (px) {
    targetUrl.searchParams.set('px', px);
  }

  location.href = targetUrl.toString();
});

function pickSingle(id) {
  const sel = document.querySelector('#' + id + ' .chip[data-selected="true"]');
  return sel ? sel.textContent.trim() : '';
}
function pickMulti(id) {
  return [
    ...document.querySelectorAll('#' + id + ' .chip[data-selected="true"]'),
  ].map((x) => x.textContent.trim());
}
