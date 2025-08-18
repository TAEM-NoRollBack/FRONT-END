// onboarding/js/profile.js (FINAL)
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

  const NEXT_PAGE = './onboarding2.html'; // ✅ 다음 스텝
  const API_URL = '/api/onboarding/profile'; // 백엔드 붙이면 여기만 맞춰

  // 소셜 프리필(있으면)
  try {
    const prefill = JSON.parse(localStorage.getItem('oauth_profile') || '{}');
    if (prefill.name) nameInput.value = prefill.name;
    if (prefill.email) emailInput.value = prefill.email;
    if (prefill.nickname) nickInput.value = prefill.nickname;
  } catch (_) {}

  // DOB 옵션 채우기
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

  // 검증
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
      gender: genderSelect.value, // 'male' | 'female' | 'none'
      birthDate: `${yearSel.value}-${monthSel.value}-${daySel.value}`, // YYYY-MM-DD
      provider: 'kakao',
    };

    btnNext.disabled = true;

    // 프론트-온리 백업 저장(다음 페이지에서 써먹게)
    try { localStorage.setItem('onboarding_profile', JSON.stringify(payload)); } catch (_) {}

    try {
      // 백엔드가 준비돼 있으면 저장 시도
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.userId) localStorage.setItem('userId', data.userId);
        window.location.href = NEXT_PAGE; // ✅ 성공 → 다음 스텝
        return;
      } else {
        // 실패해도 남 탓하지 말고 그냥 간다. MOOD.
        console.warn('Profile save failed:', await res.text().catch(() => ''));
        window.location.href = NEXT_PAGE;       // ✅ 실패 → 로컬 저장만 믿고 진행
        return;
      }
    } catch (err) {
      // 네트워크 터져도 진행
      console.warn('Network error on profile save:', err);
      window.location.href = NEXT_PAGE;         // ✅ 예외 → 진행
      return;
    } finally {
      btnNext.disabled = false;
    }
  });
})();
