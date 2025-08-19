// onboarding2.js (HOTFIX FINAL)
(() => {
  const HOME_URL = '../mainpage/home.html';

  const $ = (sel, root = document) => root.querySelector(sel);
  const form = $('#eduForm');
  const school = $('#school');
  const major = $('#major');
  const btn = $('#btnNext');

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
      persistSchoolChoice(r.value);
      closePanel();
      updateState();
      errSchool.textContent = '';
      major.focus();
    }
  });

  // ✅ 동서울 id 통일: dongseoul (home.js는 dongseoul/donseoul 모두 허용)
  const SCHOOL_MAP = {
    '가천대학교 글로벌캠퍼스': 'gachon',
    동서울대학교: 'dongseoul',
    신구대학교: 'shingu',
    '을지대학교 성남캠퍼스': 'eulji',
    // 필요시 이름 추가
    을지대: 'eulji',
    가천대학교: 'gachon',
    신구대: 'shingu',
  };
  const toSlug = (s) => s.toLowerCase().replace(/\s+/g, '');

  function persistSchoolChoice(name) {
    const id = SCHOOL_MAP[name] || toSlug(name);
    const obj = { id, name };
    try {
      localStorage.setItem('onboarding.school', JSON.stringify(obj)); // 객체 저장
      localStorage.setItem('schoolName', name); // 문자열도 병행
    } catch {}
  }

  (function prefillFromStorage() {
    const raw =
      localStorage.getItem('onboarding.school') ||
      localStorage.getItem('schoolName');
    if (!raw) {
      updateState();
      return;
    }
    try {
      const v = JSON.parse(raw);
      school.value = v?.name || v;
    } catch {
      school.value = raw;
    }
    updateState();
  })();

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

    persistSchoolChoice(school.value.trim());

    const payload = { school: school.value.trim(), major: major.value.trim() };
    try {
      sessionStorage.setItem('onboarding.education', JSON.stringify(payload));
    } catch {}

    location.href = HOME_URL;
  });

  updateState();
})();
