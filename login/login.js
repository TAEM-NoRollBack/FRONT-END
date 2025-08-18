// login.js (ONLY profile_nickname + profile_image)
document.addEventListener('DOMContentLoaded', () => {
  const JS_KEY = 'e771162067cb5bea30a5efc4c5a69160'; // 네 앱 JavaScript 키
  const REDIRECT_AFTER_LOGIN = 'onboarding.html';   // login/login.html -> ../onboarding.html

  // --- SDK 준비 ---
  if (!window.Kakao) {
    console.error('Kakao SDK 로드 실패');
    return;
  }
  if (!Kakao.isInitialized()) Kakao.init(JS_KEY);

  const $btn = document.getElementById('kakao-login-btn');
  if (!$btn) {
    console.error('#kakao-login-btn 버튼을 찾지 못함');
    return;
  }

  let busy = false; // 더블클릭 가드

  $btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    $btn.disabled = true;

    Kakao.Auth.login({
      throughTalk: false,                       // 데스크톱 팝업 안정화
      scope: 'profile_nickname,profile_image',  // 콘솔에 켜둔 두 개만
      // prompt: 'consent',                     // 새 스코프 반영 강제 필요 시 주석 해제
      success: async () => {
        try {
          const me = await Kakao.API.request({ url: '/v2/user/me' });

          // 안전하게 뽑기(신/구 응답 둘 다 대응)
          const accProfile = me?.kakao_account?.profile ?? {};
          const nickname =
            accProfile.nickname ||
            me?.properties?.nickname ||
            '사용자';
          const avatar =
            accProfile.profile_image_url ||
            accProfile.thumbnail_image_url ||
            me?.properties?.profile_image ||
            null;

          // 온보딩에서 쓰라고 로컬 저장
          const save = {
            id: me?.id ?? null,
            nickname,
            avatar,
            // 이메일은 이번 스코프에 없음
          };
          try {
            localStorage.setItem('kakaoProfile', JSON.stringify(save));
          } catch (_) {
            // storage 막혀도 넘어감
          }
        } catch (err) {
          console.error('user/me 실패', err);
          // 프로필 실패해도 온보딩은 간다
        } finally {
          location.href = REDIRECT_AFTER_LOGIN; // 무조건 온보딩으로
        }
      },
      fail: (err) => {
        console.error('로그인 실패', err);
        alert('로그인 실패: ' + (err.error_description || JSON.stringify(err)));
        busy = false;
        $btn.disabled = false;
      },
    });
  });
});
