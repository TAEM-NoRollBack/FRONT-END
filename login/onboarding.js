(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const form = $('#profileForm');
  const nameInput = $('#name');
  const nickInput = $('#nickname');
  const emailInput = $('#email');
  const genderSelect = $('#gender');
  const yearSel = $('#birthYear');
  const monthSel = $('#birthMonth');
  const daySel = $('#birthDay');
  const btnNext = $('#btnNext');

  const params = new URLSearchParams(location.search);
  const isEditMode = params.get('mode') === 'edit';

  const NEXT_PAGE = './onboarding2.html';
  const API_URL = '/api/onboarding/profile';

  // 생년월일(DOB) 옵션 채우는 함수들
  const now = new Date();
  const THIS_YEAR = now.getFullYear();
  const startYear = THIS_YEAR - 80;
  const endYear = THIS_YEAR - 13;

  function fillYears() {
    yearSel.innerHTML = `<option value="" hidden selected>YYYY</option>`;
    for (let y = endYear; y >= startYear; y--) {
      const opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      yearSel.appendChild(opt);
    }
  }
  function fillMonths() {
    monthSel.innerHTML = `<option value="" hidden selected>MM</option>`;
    for (let m = 1; m <= 12; m++) {
      const v = String(m).padStart(2, '0');
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      monthSel.appendChild(opt);
    }
  }
  function daysInYM(y, m) {
    return new Date(Number(y || 2000), Number(m || 1), 0).getDate();
  }
  function fillDays() {
    const y = yearSel.value;
    const m = monthSel.value;
    const max = daysInYM(y, m);
    const prev = daySel.value;
    daySel.innerHTML = `<option value="" hidden selected>DD</option>`;
    for (let d = 1; d <= max; d++) {
      const v = String(d).padStart(2, '0');
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      daySel.appendChild(opt);
    }
    if (prev && Number(prev) <= max) daySel.value = prev.padStart(2, '0');
  }

  yearSel.addEventListener('change', fillDays);
  monthSel.addEventListener('change', fillDays);

  fillYears();
  fillMonths();
  fillDays();

  // 기존 정보 불러오기
  function prefillForm() {
    try {
      const oauthPrefill = JSON.parse(
        localStorage.getItem('oauth_profile') || '{}'
      );
      if (oauthPrefill.name) nameInput.value = oauthPrefill.name;
      if (oauthPrefill.email) emailInput.value = oauthPrefill.email;
      if (oauthPrefill.nickname) nickInput.value = oauthPrefill.nickname;

      if (isEditMode) {
        const profileRaw = localStorage.getItem('onboarding_profile');
        if (!profileRaw) return;

        const profile = JSON.parse(profileRaw);
        nameInput.value = profile.name || '';
        nickInput.value = profile.nickname || '';
        emailInput.value = profile.email || '';
        genderSelect.value = profile.gender || '';

        if (profile.birthDate) {
          const [year, month, day] = profile.birthDate.split('-');
          yearSel.value = year;
          monthSel.value = month;
          fillDays();
          daySel.value = day;
        }
        btnNext.textContent = '다음';
      }
    } catch (e) {
      console.error('기존 프로필 정보를 불러오는 데 실패했습니다.', e);
    }
  }
  prefillForm();

  // 검증 관련 변수 및 함수
  const errs = {
    name: $('#err-name'),
    nickname: $('#err-nickname'),
    email: $('#err-email'),
    gender: $('#err-gender'),
    birth: $('#err-birth'),
  };
  function clearErrors() {
    Object.values(errs).forEach((el) => (el.textContent = ''));
  }
  function validate() {
    clearErrors();
    let ok = true;
    if (!nameInput.value.trim()) {
      errs.name.textContent = '이름을 입력해주세요.';
      ok = false;
    }
    if (!nickInput.value.trim()) {
      errs.nickname.textContent = '별명을 입력해주세요.';
      ok = false;
    }
    const email = emailInput.value.trim();
    if (!email) {
      errs.email.textContent = '이메일을 입력해주세요.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email.textContent = '올바른 이메일 형식이 아닙니다.';
      ok = false;
    }
    if (!genderSelect.value) {
      errs.gender.textContent = '성별을 선택해주세요.';
      ok = false;
    }
    if (!yearSel.value || !monthSel.value || !daySel.value) {
      errs.birth.textContent = '생년월일을 모두 선택해주세요.';
      ok = false;
    }
    return ok;
  }

  // 제출
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: nameInput.value.trim(),
      nickname: nickInput.value.trim(),
      email: emailInput.value.trim(),
      gender: genderSelect.value,
      birthDate: `${yearSel.value}-${monthSel.value}-${daySel.value}`,
      provider: 'kakao',
    };

    btnNext.disabled = true;
    try {
      localStorage.setItem('onboarding_profile', JSON.stringify(payload));
    } catch (_) {}

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.userId) localStorage.setItem('userId', data.userId);
      } else {
        console.warn('Profile save failed:', await res.text().catch(() => ''));
      }
    } catch (err) {
      console.warn('Network error on profile save:', err);
    } finally {
      if (isEditMode) {
        window.location.href = `${NEXT_PAGE}?mode=edit`;
      } else {
        window.location.href = NEXT_PAGE;
      }
    }
  });
})();
