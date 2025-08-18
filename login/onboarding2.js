// onboarding2.js (HOTFIX FINAL)
(() => {
  const HOME_URL = '../mainpage/home.html'; // 경로 다르면 수정

  const $ = (sel, root = document) => root.querySelector(sel);
  const form   = $('#eduForm');
  const school = $('#school');
  const major  = $('#major');
  const btn    = $('#btnNext');

  const errSchool = $('#errSchool');
  const errMajor  = $('#errMajor');

  // ==== 커스텀 학교 선택 패널 ====
  const schoolBox     = $('#schoolBox');
  const schoolOptions = $('#schoolOptions');

  const openPanel  = () => { schoolOptions.hidden = false; };
  const closePanel = () => { schoolOptions.hidden = true;  };

  // ====== ✅ 검증/상태 함수: 먼저 선언(호이스팅되게) ======
  function isFilled() {
    return school.value.trim().length > 0 && major.value.trim().length > 0;
  }
  function updateState() {
    btn.disabled = !isFilled();
    if (school.value.trim()) errSchool.textContent = '';
    if (major.value.trim())  errMajor.textContent  = '';
  }

  // 인풋 클릭/포커스 시 열기
  school.addEventListener('click', openPanel);
  school.addEventListener('focus', openPanel);
  school.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
  });

  // 외부 클릭/ESC 닫기
  document.addEventListener('click', (e) => {
    if (!schoolBox.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // 라디오 옵션 위임
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

  // ==== 저장 로직 ====
  const SCHOOL_MAP = {
    '가천대학교 글로벌캠퍼스': 'gachon',
    '동서울대학교': 'dongseoul',
    '신구대학교': 'shingu',
    '을지대학교 성남캠퍼스': 'eulji',
  };
  const toSlug = (s) => s.toLowerCase().replace(/\s+/g, '');

  function persistSchoolChoice(name) {
    const id = SCHOOL_MAP[name] || toSlug(name);
    const obj = { id, name };
    try {
      localStorage.setItem('onboarding.school', JSON.stringify(obj)); // 객체
      localStorage.setItem('schoolName', name);                       // 문자열
    } catch {}
  }

  // 이전 저장값 프리필 (이제 updateState/isFilled 이후에 호출됨)
  (function prefillFromStorage() {
    const raw = localStorage.getItem('onboarding.school') || localStorage.getItem('schoolName');
    if (!raw) { updateState(); return; }
    try {
      const v = JSON.parse(raw);
      school.value = v?.name || v;
    } catch {
      school.value = raw;
    }
    updateState();
  })();

  // 전공 입력 시 버튼 상태 갱신
  major.addEventListener('input', updateState);

  // ==== 제출 ====
  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!isFilled()) {
      if (!school.value.trim()) errSchool.textContent = '학교를 선택해주세요.';
      if (!major.value.trim())  errMajor.textContent  = '전공을 입력해주세요.';
      if (!school.value.trim()) school.focus();
      else major.focus();
      return;
    }

    busy = true;
    btn.disabled = true;

    // 수동 입력 대비 최종 저장
    persistSchoolChoice(school.value.trim());

    const payload = {
      school: school.value.trim(),
      major : major.value.trim(),
    };

    try {
      // 백엔드 붙을 때 교체
      // await fetch('/api/profile/education', { ... });
      sessionStorage.setItem('onboarding.education', JSON.stringify(payload));
    } catch {}

    // ✅ 홈으로 이동
    location.href = HOME_URL;
  });

  // 초기 상태 한번 세팅(혹시 프리필 없을 때)
  updateState();
})();
