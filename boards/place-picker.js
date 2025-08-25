/* place-picker.js */
(() => {
  const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청 근처
  const SELECTOR_BTN = '#placeBtn';
  const SELECTOR_TEXT = '#placeText';

  // --- style ---
  const CSS = `
  .pp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);
    display:none;align-items:center;justify-content:center;z-index:99999}
  .pp-overlay.show{display:flex}
  .pp-sheet{width:min(92vw,700px);max-width:700px;background:#fff;border-radius:12px;
    box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden}
  .pp-head{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #eee}
  .pp-search{flex:1;border:1px solid #e4e4e7;border-radius:8px;padding:10px 12px;font-size:14px;outline:none}
  .pp-btn{border:0;background:#111;color:#fff;border-radius:8px;padding:10px 12px;font-size:14px;cursor:pointer}
  .pp-btn.text{background:transparent;color:#111}
  .pp-body{display:grid;grid-template-columns:1fr 280px;min-height:min(76vh,760px)}
  .pp-map{min-height:360px}
  .pp-side{border-left:1px solid #eee;display:flex;flex-direction:column;min-height:260px}
  .pp-list{flex:1;overflow:auto}
  .pp-item{padding:10px 12px;border-bottom:1px solid #f1f1f3;cursor:pointer}
  .pp-item strong{display:block;font-size:14px}
  .pp-item span{display:block;font-size:12px;color:#666;margin-top:2px}
  .pp-foot{display:flex;gap:8px;align-items:center;justify-content:space-between;border-top:1px solid #eee;padding:10px 12px}
  .pp-picked{font-size:12px;color:#444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
  .pp-actions{display:flex;gap:8px}
  @media (max-width: 720px){
    .pp-body{grid-template-columns:1fr}
    .pp-side{border-left:0;border-top:1px solid #eee;min-height:180px}
  }`;

  function injectCSS() {
    if (document.getElementById('pp-style')) return;
    const s = document.createElement('style');
    s.id = 'pp-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => c && n.appendChild(c));
    return n;
  }

  // --- Modal / UI ---
  function createModal() {
    injectCSS();

    const ov = el('div', { class: 'pp-overlay', id: 'pp-overlay' });
    const sheet = el('div', { class: 'pp-sheet' });

    // header
    const input = el('input', { class: 'pp-search', id: 'pp-search', type: 'search', placeholder: '장소 검색 (카카오)' });
    const btnClose = el('button', { class: 'pp-btn text', type: 'button', id: 'pp-close', text: '닫기' });
    const head = el('div', { class: 'pp-head' }, [input, btnClose]);

    // body
    const mapBox = el('div', { class: 'pp-map', id: 'pp-map' });
    const listBox = el('div', { class: 'pp-list', id: 'pp-results' });
    const side = el('div', { class: 'pp-side' }, [listBox]);
    const body = el('div', { class: 'pp-body' }, [mapBox, side]);

    // footer
    const picked = el('div', { class: 'pp-picked', id: 'pp-picked', text: '위치를 선택하세요.' });
    const btnUse = el('button', { class: 'pp-btn', type: 'button', id: 'pp-use', text: '이 위치 선택' });
    const btnCancel = el('button', { class: 'pp-btn text', type: 'button', id: 'pp-cancel', text: '취소' });
    const actions = el('div', { class: 'pp-actions' }, [btnCancel, btnUse]);
    const foot = el('div', { class: 'pp-foot' }, [picked, actions]);

    sheet.append(head, body, foot);
    ov.appendChild(sheet);
    document.body.appendChild(ov);

    return {
      overlay: ov,
      input,
      btnClose,
      mapBox,
      results: listBox,
      picked,
      btnUse,
      btnCancel,
      destroy() { ov.remove(); }
    };
  }

  // --- Geolocation helper ---
  function getGeoCenter() {
    return new Promise((res) => {
      if (!navigator.geolocation) return res(DEFAULT_CENTER);
      navigator.geolocation.getCurrentPosition(
        (pos) => res({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => res(DEFAULT_CENTER),
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
      );
    });
  }

  // --- Main Picker Logic ---
  async function openPicker({ onSelect } = {}) {
    const ui = createModal();
    const { overlay, mapBox, input, results, picked, btnUse, btnClose, btnCancel } = ui;

    document.body.classList.add('modal-open');
    overlay.classList.add('show');

    const center = await getGeoCenter();
    const map = await window.MapProvider.initMap(mapBox, center, 4);

    // Draggable marker
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(center.lat, center.lng),
      map, draggable: true
    });

    const hasServices = !!kakao.maps.services;
    const geocoder = hasServices && new kakao.maps.services.Geocoder();
    const places = hasServices && new kakao.maps.services.Places();

    let current = {
      lat: center.lat,
      lng: center.lng,
      address: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
      name: '',
      id: null
    };

    function setPickedText() {
      picked.textContent = current.address ? `${current.name ? current.name + ' · ' : ''}${current.address}` : '위치를 선택하세요.';
    }

    function setMarker(lat, lng) {
      const pos = new kakao.maps.LatLng(lat, lng);
      marker.setPosition(pos);
      map.setCenter(pos);
      current.lat = lat; current.lng = lng; current.id = null; // id는 검색선택시에만
      // reverse geocode (fallback: lat,lng)
      if (geocoder && geocoder.coord2Address) {
        geocoder.coord2Address(lng, lat, (result, status) => {
          if (status === kakao.maps.services.Status.OK && result?.length) {
            const r = result[0];
            const addr = r.road_address?.address_name || r.address?.address_name;
            current.address = addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          } else {
            current.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
          setPickedText();
        });
      } else {
        current.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setPickedText();
      }
    }

    // init text
    setPickedText();

    // map click -> move marker
    kakao.maps.event.addListener(map, 'click', (mEvt) => {
      const latlng = mEvt.latLng;
      current.name = '';
      setMarker(latlng.getLat(), latlng.getLng());
    });

    kakao.maps.event.addListener(marker, 'dragend', () => {
      const p = marker.getPosition();
      current.name = '';
      setMarker(p.getLat(), p.getLng());
    });

    // Search (if services available)
    async function doSearch(q) {
      results.innerHTML = '';
      if (!q || !q.trim()) return;
      if (!places) {
        const li = el('div', { class: 'pp-item' }, [
          el('strong', { text: '검색 라이브러리 없음' }),
          el('span', { text: 'Map SDK가 services 라이브러리 없이 로드됨' })
        ]);
        results.append(li);
        return;
      }
      places.keywordSearch(q.trim(), (data, status) => {
        if (status !== kakao.maps.services.Status.OK || !Array.isArray(data)) {
          const li = el('div', { class: 'pp-item' }, [
            el('strong', { text: '검색 결과 없음' }),
            el('span', { text: '다른 키워드를 시도해 보세요' })
          ]);
          results.append(li);
          return;
        }
        results.innerHTML = '';
        const coords = [];
        data.slice(0, 20).forEach((it) => {
          const name = it.place_name;
          const addr = it.road_address_name || it.address_name || '';
          const lat = parseFloat(it.y), lng = parseFloat(it.x);
          coords.push({ lat, lng });
          const row = el('div', { class: 'pp-item' }, [
            el('strong', { text: name }),
            el('span', { text: addr })
          ]);
          row.addEventListener('click', () => {
            current = { name, address: addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng, id: it.id || null };
            setMarker(lat, lng);
            setPickedText();
          });
          results.append(row);
        });
        window.MapProvider.fitBounds(map, coords);
      }, { useMapBounds: true });
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch(input.value);
    });

    // close helpers
    function close() {
      overlay.classList.remove('show');
      ui.destroy();
      document.body.classList.remove('modal-open');
    }
    btnClose.addEventListener('click', close);
    btnCancel.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    window.addEventListener('keydown', escClose);
    function escClose(e) { if (e.key === 'Escape') { close(); window.removeEventListener('keydown', escClose); } }

    // confirm
    btnUse.addEventListener('click', () => {
      close();
      onSelect?.(current);
    });
  }

  // --- Public API & auto wiring ---
  function wireButton(btn, textEl) {
    if (!btn) return;
    // 캡처 단계에서 가로채 기존 prompt 핸들러가 실행되지 않게 처리
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      openPicker({
        onSelect(place) {
          // 1) DOM 표시
          if (textEl) textEl.textContent = place.address || `${place.lat}, ${place.lng}`;
          btn.classList.remove('empty'); btn.classList.add('filled');
          // 2) data-place 속성에 JSON 저장
          try { btn.setAttribute('data-place', JSON.stringify(place)); } catch {}
          // 3) 이벤트 통지 (필요시 외부에서 수신)
          const ev = new CustomEvent('place:select', { bubbles: true, detail: place });
          btn.dispatchEvent(ev);
          // 4) 혹시 외부 브릿지가 있으면 호출 (선택)
          if (typeof window.__setPlace === 'function') {
            try { window.__setPlace(place); } catch {}
          }
        }
      });
    }, true); // capture = true
  }

  function auto() {
    const btn = document.querySelector(SELECTOR_BTN);
    const text = document.querySelector(SELECTOR_TEXT) || btn?.querySelector(SELECTOR_TEXT);
    if (!btn) return;
    wireButton(btn, text);
  }

  // 글로벌 공개
  window.PlacePicker = {
    open: openPicker,
    attach: (buttonOrSelector, textOrSelector) => {
      const btn = typeof buttonOrSelector === 'string' ? document.querySelector(buttonOrSelector) : buttonOrSelector;
      const txt = typeof textOrSelector === 'string'
        ? document.querySelector(textOrSelector)
        : (textOrSelector || null);
      wireButton(btn, txt);
    }
  };

  // DOM 준비되면 자동 연결 (#placeBtn/#placeText가 있을 때)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', auto);
  } else {
    auto();
  }
})();
