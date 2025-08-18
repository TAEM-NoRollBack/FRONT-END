window.MapProvider = (() => {
  // 1) 키는 localStorage('kakao.appkey') → 없으면 하드코딩한 JS 키를 사용
  const KEY =
    localStorage.getItem('kakao.appkey') ||
    'e771162067cb5bea30a5efc4c5a69160'; // <- 네 JS 키

  // 2) URL은 반드시 https 명시 + 키는 안전하게 인코딩
  const SDK = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
    KEY
  )}&autoload=false`;

  // 3) 로더: crossOrigin, referrerPolicy 같은 건 절대 넣지 말 것!
  function load() {
    return new Promise((res, rej) => {
      if (window.kakao?.maps) return res(); // 이미 로드된 경우

      const s = document.createElement('script');
      s.src = SDK;
      s.async = true;
      s.onload = () => {
        try {
          kakao.maps.load(res);
        } catch (e) {
          rej(e);
        }
      };
      s.onerror = () => rej(new Error('SDK_LOAD_FAILED'));

      document.head.appendChild(s);
    });
  }

  async function initMap(container, { lat, lng }, level = 4) {
    await load();
    const center = new kakao.maps.LatLng(lat, lng);
    return new kakao.maps.Map(container, { center, level });
  }

  function addMarker(map, { lat, lng, meta, label }) {
    const pos = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({ position: pos, map });
    marker.meta = meta;
    if (label) {
      const iw = new kakao.maps.InfoWindow({
        content: `<div style="padding:4px 6px;font-size:12px">${label}</div>`,
      });
      kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker));
      kakao.maps.event.addListener(marker, 'mouseout', () => iw.close());
    }
    return marker;
  }

  function onClick(marker, cb) {
    kakao.maps.event.addListener(marker, 'click', () => cb(marker.meta));
  }

  function fitBounds(map, coords) {
    if (!coords?.length) return;
    const b = new kakao.maps.LatLngBounds();
    coords.forEach((c) => b.extend(new kakao.maps.LatLng(c.lat, c.lng)));
    map.setBounds(b, 20, 20, 20, 20);
  }

  return { initMap, addMarker, onClick, fitBounds };
})();