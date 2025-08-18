
window.MockAPI = (() => {
  // 학교 좌표(예시) — onboarding2에서 저장한 이름과 매핑
  const SCHOOLS = [
    { id:'gachon', name:'가천대학교', lat:37.4523, lng:127.1290 },
    { id:'seongnam', name:'성남시청', lat:37.4200, lng:127.1265 }, // fallback
  ];

  // 전통시장
  const MARKETS = [
    { id:'sinhung', name:'신흥시장', lat:37.4419, lng:127.1295, area:'성남' },
    { id:'moran',   name:'모란시장', lat:37.4328, lng:127.1290, area:'성남' },
  ];

  // 상점
  const PLACES = [
    { id:'p1', market_id:'sinhung', name:'진선보쌈', lat:37.4426,lng:127.1303, rating:4.5, review_count:23, category:'보쌈', photos:['https://picsum.photos/seed/food1a/640/400'] },
    { id:'p2', market_id:'sinhung', name:'한촌설렁탕 성남점', lat:37.4413,lng:127.1269, rating:4.0, review_count:23, category:'설렁탕', photos:['https://picsum.photos/seed/food2a/640/400'] },
    { id:'p3', market_id:'moran',   name:'칼국수집', lat:37.4335,lng:127.1276, rating:4.6, review_count:18, category:'칼국수', photos:['https://picsum.photos/seed/food3a/640/400'] },
  ];

  const toRad = d => d*Math.PI/180;
  const distM = (a,b,c,d) => {
    const R=6371000, dLat=toRad(c-a), dLon=toRad(d-b);
    const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  };

  return {
    getSchoolSaved(){
      try { return JSON.parse(localStorage.getItem('onboarding.school')||'null'); } catch(e){ return null; }
    },
    resolveSchool(sNameOrId){
      if (!sNameOrId) return SCHOOLS[1]; // fallback
      return SCHOOLS.find(s => s.id===sNameOrId || s.name===sNameOrId) || SCHOOLS[1];
    },
    listMarketsNear({lat,lng, radius=3000}){
      return MARKETS
        .map(m => ({...m, distance_m: distM(lat,lng,m.lat,m.lng)}))
        .filter(m => m.distance_m <= radius)
        .sort((a,b)=> a.distance_m-b.distance_m);
    },
    listPlaces(){ return PLACES.slice(); },
    listPlacesByMarket(marketId){
      return PLACES.filter(p=>p.market_id===marketId).sort((a,b)=> b.rating-a.rating);
    },
    search(q){
      q = (q||'').trim().toLowerCase();
      if (!q) return { markets: MARKETS.slice(0,5), places: PLACES.slice(0,5) };
      const markets = MARKETS.filter(m => m.name.toLowerCase().includes(q));
      const places  = PLACES.filter(p => p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q));
      return { markets, places };
    }
  }
})();
