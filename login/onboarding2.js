(() => {
  const HOME_URL = '../mainpage/home.html';
  const MYPAGE_URL = '../mypage/mypage.html';

  const $ = (sel, root = document) => root.querySelector(sel);
  const form = $('#eduForm');
  const school = $('#school');
  const major = $('#major');
  const btn = $('#btnNext');

  const params = new URLSearchParams(location.search);
  const isEditMode = params.get('mode') === 'edit';

  const errSchool = $('#errSchool');
  const errMajor = $('#errMajor');
  const schoolBox = $('#schoolBox');
  const schoolOptions = $('#schoolOptions');

  const openPanel = () => {
    schoolOptions.hidden = false;
  };
  const closePanel = () => {
    schoolOptions.hidden = true;
  };

  function isFilled() {
    return school.value.trim().length > 0 && major.value.trim().length > 0;
  }
  function updateState() {
    btn.disabled = !isFilled();
    if (school.value.trim()) errSchool.textContent = '';
    if (major.value.trim()) errMajor.textContent = '';
  }

  school.addEventListener('click', openPanel);
  school.addEventListener('focus', openPanel);
  school.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel();
    }
  });
  document.addEventListener('click', (e) => {
    if (!schoolBox.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  schoolOptions.addEventListener('change', (e) => {
    const r = e.target;
    if (r && r.name === 'schoolOpt') {
      school.value = r.value;
      closePanel();
      updateState();
      errSchool.textContent = '';
      major.focus();
    }
  });

  major.addEventListener('input', updateState);

  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!isFilled()) {
      if (!school.value.trim()) errSchool.textContent = '학교를 선택해주세요.';
      if (!major.value.trim()) errMajor.textContent = '전공을 입력해주세요.';
      if (!school.value.trim()) school.focus();
      else major.focus();
      return;
    }

    busy = true;
    btn.disabled = true;

    try {
      const profileRaw = localStorage.getItem('onboarding_profile');
      const profile = profileRaw ? JSON.parse(profileRaw) : {};

      profile.school = school.value.trim();
      profile.major = major.value.trim();

      const SCHOOL_MAP = {
        '가천대학교 글로벌캠퍼스': 'gachon',
        동서울대학교: 'dongseoul',
        신구대학교: 'shingu',
        '을지대학교 성남캠퍼스': 'eulji',
        을지대: 'eulji',
        가천대학교: 'gachon',
        신구대: 'shingu',
      };
      const toSlug = (s) => s.toLowerCase().replace(/\s+/g, '');
      profile.schoolId = SCHOOL_MAP[profile.school] || toSlug(profile.school);

      localStorage.setItem('onboarding_profile', JSON.stringify(profile));
    } catch (err) {
      console.error('프로필 저장 중 오류 발생:', err);
    }

    location.href = isEditMode ? MYPAGE_URL : HOME_URL;
  });

  // 페이지 로드 시
  (() => {
    try {
      const profileRaw = localStorage.getItem('onboarding_profile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        if (profile.school) school.value = profile.school;
        if (profile.major) major.value = profile.major;
      }
    } catch {}

    if (isEditMode) {
      btn.textContent = '수정 완료';
    }

    updateState();
  })();
})();
