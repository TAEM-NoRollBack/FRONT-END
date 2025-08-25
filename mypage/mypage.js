// 데이터 표시 기능
(function () {
  try {
    // 온보딩 때 저장한 프로필 정보를 localStorage에서 가져옵니다.
    const profileRaw = localStorage.getItem('onboarding_profile');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const displayNameEl = document.getElementById('displayName');

      // 'nickname'(별명)이 있다면 화면에 표시합니다.
      if (profile.nickname && displayNameEl) {
        displayNameEl.textContent = profile.nickname;
      }
    }
  } catch (e) {
    console.error('프로필 정보를 불러오는 데 실패했습니다.', e);
  }
})();

// 내비게이션/액션
(function () {
  // 프로필 수정으로 이동
  const goEdit = () => {
    // 온보딩 페이지로 이동하되, '수정 모드'임을 알리는 파라미터를 추가합니다.
    location.href = '../login/onboarding.html?mode=edit';
  };

  document.getElementById('btnEditProfile')?.addEventListener('click', goEdit);
  document.getElementById('btnEditArrow')?.addEventListener('click', goEdit);

  // 포인트 내역
  document.getElementById('btnHistory')?.addEventListener('click', () => {
    // TODO: 실제 적립내역 페이지 경로로 교체
    location.href = './points-history.html';
  });

  // 상품권 교환
  document.getElementById('btnCoupon')?.addEventListener('click', () => {
    alert('상품권 교환은 곧 연동된다. Hold tight, bro.');
  });
})();
document.getElementById('btnHistory')?.addEventListener('click', () => {
  location.href = './point.html'; // 같은 폴더에 point.html
});
