(() => {
  const form   = document.getElementById('eduForm');
  const school = document.getElementById('school');
  const major  = document.getElementById('major');
  const btn    = document.getElementById('btnNext');

  const errSchool = document.getElementById('errSchool');
  const errMajor  = document.getElementById('errMajor');

  // ===== 커스텀 학교 선택 패널 =====
  const schoolBox     = document.getElementById('schoolBox');
  const schoolOptions = document.getElementById('schoolOptions');
  const schoolRadios  = schoolOptions.querySelectorAll('input[name="schoolOpt"]');

  const openPanel  = () => { schoolOptions.hidden = false; };
  const closePanel = () => { schoolOptions.hidden = true;  };

  // 인풋 탭/클릭 시 패널 열기 (키보드 방지용 readonly)
  school.addEventListener('click', openPanel);
  school.addEventListener('focus', openPanel);

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!schoolBox.contains(e.target)) closePanel();
  });

  // ESC 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // 옵션 선택 시 값 반영하고 닫기
  schoolRadios.forEach((r) => {
    r.addEventListener('change', () => {
      school.value = r.value;
      closePanel();
      updateState();
    });
  });

  // ===== 폼 유효성 + 버튼 상태 =====
  const isFilled = () =>
    school.value.trim().length > 0 && major.value.trim().length > 0;

  const updateState = () => {
    btn.disabled = !isFilled();
    if (school.value.trim()) errSchool.textContent = '';
    if (major.value.trim())  errMajor.textContent  = '';
  };

  major.addEventListener('input', updateState);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isFilled()) {
      if (!school.value.trim()) errSchool.textContent = '학교를 선택해주세요.';
      if (!major.value.trim())  errMajor.textContent  = '전공을 입력해주세요.';
      return;
    }

    const payload = {
      school: school.value.trim(),
      major : major.value.trim(),
    };

    // 나중에 백엔드 연동 시 아래 fetch만 교체
    // await fetch('/api/profile/education', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    sessionStorage.setItem('onboarding.education', JSON.stringify(payload));

    // 다음 단계로 이동 (파일명에 맞게 변경)
    // location.href = './onboarding3.html';
    console.log('saved:', payload);
    alert('입력이 저장되었습니다. (연동 시 자동 이동 예정)');
  });

  // 초기 상태
  updateState();
})();
