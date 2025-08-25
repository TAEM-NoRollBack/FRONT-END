(function () {
  // 안전하게 바인딩: DOM이 이미 만들어진 뒤 실행
  var btn = document.getElementById('btnBack');
  if (!btn) return;

  btn.addEventListener('click', function () {
    // 히스토리 없으면 point.html로 폴백
    if (document.referrer && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = './point.html';  // reward.html과 같은 폴더에 있을 때
    }
  });
})();