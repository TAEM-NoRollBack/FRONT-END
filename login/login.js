// Front-only MOCK (백엔드 미배포 상태)
const $signup = document.getElementById('btnSignup');
const $kakao = document.getElementById('btnKakao');

$signup?.addEventListener('click', () => {
  alert('회원가입 화면은 프론트만 먼저 구현 예정입니다. (라우팅 연결 예정)');
});

$kakao?.addEventListener('click', () => {
  alert('카카오 로그인은 백엔드 배포 후 연결됩니다. (MOCK 동작)');
});

console.log(
  '%c시장백서 로그인-1 READY',
  'padding:4px 8px;background:#FF83A2;color:#fff;border-radius:6px'
);
