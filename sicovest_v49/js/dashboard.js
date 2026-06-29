/* dashboard.js — SicOvest Next V49 */
// MAPPA
function renderMappa(){
  var el=$id('tab-mappa');if(!el)return;
  var cnt={};S.fleet.forEach(function(v){var s=v.SEDE||'Altro';cnt[s]=(cnt[s]||0)+1;});
  var coords={Palermo:{x:310,y:120},Trapani:{x:85,y:145},Agrigento:{x:285,y:292},Caltanissetta:{x:382,y:242},Bagheria:{x:362,y:108},Sciacca:{x:165,y:278},Marsala:{x:72,y:222},'Mazara Del Vallo':{x:92,y:262},'Termini Imerese':{x:288,y:88},"Cefalu'":{x:285,y:62},Alcamo:{x:162,y:142},Enna:{x:402,y:175},Partinico:{x:218,y:135},Gela:{x:422,y:302},Licata:{x:362,y:312},'Canicattì':{x:342,y:272},'San Cataldo':{x:378,y:215},'S. Cataldo':{x:378,y:220},Mussomeli:{x:308,y:235},Pantelleria:{x:108,y:390}};
  var pins=Object.entries(cnt).map(function(e){var s=e[0],n=e[1],c=coords[s];if(!c)return '';var r=Math.min(20,9+n/6);return '<g onclick="filterBySede(\''+esc(s)+'\')" style="cursor:pointer;"><circle cx="'+c.x+'" cy="'+c.y+'" r="'+r+'" fill="#2563eb" opacity=".87" stroke="#fff" stroke-width="2"/><text x="'+c.x+'" y="'+(c.y+1)+'" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="'+(n>9?9:10)+'" font-weight="700">'+n+'</text><title>'+esc(s)+': '+n+'</title></g>';}).join('');
  var svg='<svg viewBox="0 0 560 430" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;"><rect width="560" height="430" fill="#bfdbfe"/><path d="M80 160 Q100 130 160 130 L200 110 Q250 80 290 70 L340 60 Q370 55 410 65 L450 80 Q480 100 490 130 L500 160 Q510 190 490 220 L470 250 Q450 280 420 310 L380 330 Q340 350 300 340 L260 330 Q220 310 190 290 L150 260 Q110 230 90 200 Z" fill="#d1fae5" stroke="#6ee7b7" stroke-width="1.5"/>'+pins+'<text x="12" y="420" font-size="9" fill="#64748b">📍 Clicca su una sede per filtrare</text></svg>';
  var sorted=Object.entries(cnt).sort(function(a,b){return b[1]-a[1];});
  el.innerHTML='<div class="vtable-wrap"><div class="vtable-header"><h3>🗺️ Mappa Sicilia Ovest</h3></div>'+svg+'</div>'+
    '<div class="sec-t" style="margin-top:8px;">📍 Veicoli per sede</div><div class="stat-grid">'+
    sorted.map(function(e){return '<div class="stat-card" style="cursor:pointer;" onclick="filterBySede(\''+esc(e[0])+'\')"><div class="si" style="background:#dbeafe;">📍</div><div><div class="sn">'+e[1]+'</div><div class="sl">'+esc(e[0])+'</div></div></div>';}).join('')+'</div>';}

function filterBySede(s){switchTab('flotta');S.query=s.toLowerCase();S.page=0;var si=$id('search-input');if(si)si.value=s;var cl=$id('search-clear');if(cl)cl.style.display='flex';renderFlotta();}

// DASHBOARD
function renderDashboard(){
  var el=$id('tab-dashboard');if(!el)return;
  var fl=S.fleet;
  var ass=fl.filter(function(v){var a=getAss(v.TARGA),ut=getUT(v.TARGA);return a&&!ut;}).length;
  var scL=fl.filter(function(v){var ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};return ut==='SCORTA'&&!rt.assegnato_a&&rt.stato!=='Officina';}).length;
  var scTot=fl.filter(function(v){return getUT(v.TARGA)==='SCORTA';}).length;
  var tec=fl.filter(function(v){return getUT(v.TARGA)==='TECNICO';}).length;
  var spec=fl.filter(function(v){var ut=getUT(v.TARGA);return (v.VEICOLO_SPECIALE||'').toUpperCase()==='SI'||ut==='SPECIALI';}).length;
  var off=fl.filter(function(v){return (S.runtime[v.TARGA]||{}).stato==='Officina';}).length;
  var att=fl.length-off;
  var tktO=S.tickets.filter(function(t){return t.stato==='APERTO';}).length;
  var epC=S.ep.filter(function(e){return (e.ATTIVO||'').toUpperCase()==='SI';}).length;
  var ztlE=fl.filter(function(v){return getZTL(v.TARGA).some(function(z){return ztlExpiring(z.scadenza);});}).length;

  // Calcola tipi veicolo (Van/Car/Truck) per donut
  var van=0,car=0,truck=0;
  fl.forEach(function(v){
    var t=(v.TIPO_VEICOLO||'').toLowerCase();
    if(t.includes('ducato')||t.includes('daily')||t.includes('iveco'))truck++;
    else if(t.includes('panda')||t.includes('caddy')||t.includes('giulia'))car++;
    else van++;});

  // Donut SVG
  var total=fl.length||1;
  function seg(val,tot,r,cx,cy,offset,color){
    if(!val)return '';
    var pct=val/tot,angle=pct*2*Math.PI;
    var x1=cx+r*Math.cos(offset-Math.PI/2),y1=cy+r*Math.sin(offset-Math.PI/2);
    var x2=cx+r*Math.cos(offset+angle-Math.PI/2),y2=cy+r*Math.sin(offset+angle-Math.PI/2);
    var lg=angle>Math.PI?1:0;
    return '<path d="M'+cx+' '+cy+' L'+x1+' '+y1+' A'+r+' '+r+' 0 '+lg+' 1 '+x2+' '+y2+' Z" fill="'+color+'"/>';}
  var cx=70,cy=70,r=60,ri=35;
  var segs='',off2=0;
  var colors=[['#60a5fa',van],['#4ade80',car],['#fbbf24',truck],['#f87171',off],['#a78bfa',scTot]];
  colors.forEach(function(c){segs+=seg(c[1],total,r,cx,cy,off2,c[0]);off2+=c[1]/total*2*Math.PI;});
  var donutSvg='<svg width="140" height="140" viewBox="0 0 140 140">'+segs+
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+ri+'" fill="#1a2e6e"/>'+
    '<text x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle" fill="#fff" font-size="18" font-weight="900">'+fl.length+'</text>'+
    '<text x="'+cx+'" y="'+(cy+10)+'" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="600">TOTALE</text>'+
  '</svg>';

  // Legenda donut
  var legenda=[
    ['#60a5fa','Van',van],['#4ade80','Car',car],['#fbbf24','Truck',truck],
    ['#f87171','Officina',off],['#a78bfa','Scorta',scTot],['#67e8f9','Tecnico',tec],
    ['#fb923c','Speciali',spec]];
  var legHtml=legenda.map(function(l){
    return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">'+
      '<span style="width:10px;height:10px;border-radius:2px;background:'+l[0]+';flex-shrink:0;display:inline-block;"></span>'+
      '<span style="font-size:11px;color:#93c5fd;">'+l[1]+':</span>'+
      '<span style="font-size:11px;color:#fff;font-weight:700;">'+l[2]+'</span></div>';}).join('');

  // Header dashboard stile screenshot (dark)
  var h='<div style="background:var(--navy);border-radius:var(--radius);padding:14px 16px;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,0,0,.25);">';
  // Top row: donut + legenda + KPI box
  h+='<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">';
  // Donut
  h+='<div>'+donutSvg+'</div>';
  // Legenda
  h+='<div style="flex:1;min-width:120px;">'+legHtml+'</div>';
  // KPI boxes (stile screenshot - 3 box con numero grande)
  h+='<div style="display:flex;flex-direction:column;gap:6px;min-width:80px;">';
  h+='<div style="background:rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;text-align:center;cursor:pointer;" onclick="switchTab(\x27flotta\x27)">';
  h+='<div style="font-size:22px;font-weight:900;color:#60a5fa;">'+fl.length+'</div>';
  h+='<div style="font-size:9px;color:#93c5fd;text-transform:uppercase;letter-spacing:.4px;">Veicoli</div></div>';
  h+='<div style="background:rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;text-align:center;cursor:pointer;" onclick="switchTab(\x27manut\x27)">';
  h+='<div style="font-size:22px;font-weight:900;color:#4ade80;">'+att+'</div>';
  h+='<div style="font-size:9px;color:#93c5fd;text-transform:uppercase;letter-spacing:.4px;">Attivi</div></div>';
  h+='<div style="background:rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;text-align:center;cursor:pointer;" onclick="switchTab(\x27ticket\x27)">';
  h+='<div style="font-size:22px;font-weight:900;color:#f87171;">'+off+'</div>';
  h+='<div style="font-size:9px;color:#93c5fd;text-transform:uppercase;letter-spacing:.4px;">Officina</div></div>';
  h+='</div>';
  // Ticket box (destra estrema)
  if(tktO>0){
    h+='<div style="background:#991b1b;border-radius:8px;padding:10px 14px;text-align:center;min-width:70px;cursor:pointer;" onclick="switchTab(\x27ticket\x27)">';
    h+='<div style="font-size:9px;color:#fca5a5;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px;">Ticket</div>';
    h+='<div style="font-size:28px;font-weight:900;color:#fff;">'+tktO+'</div>';
    if(S.tickets.length>0){var lt=S.tickets[0];h+='<div style="font-size:9px;color:#fca5a5;">'+esc(lt.targa)+' – '+esc(lt.tipo)+'</div>';}
    h+='</div>';}
  h+='</div></div>';

  // Riga 2: stat cards stile screenshot (grid compatta)
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:12px;">';
  var statItems=[
    {bg:'#1e3a5f',ic:'✅',n:att,l:'Attivi',sub:'in servizio'},
    {bg:'#1e4d3a',ic:'🔄',n:scL,l:'Scorte libere',sub:'disponibili'},
    {bg:'#4a1942',ic:'🔧',n:off,l:'In officina',sub:'in riparazione'},
    {bg:'#3b2a1a',ic:'🎫',n:tktO,l:'Ticket aperti',sub:'segnalazioni'},
    {bg:'#1a3a4a',ic:'🅿️',n:epC,l:'EasyPark',sub:'attivi'},
    {bg:'#3a2a10',ic:'⚠️',n:ztlE,l:'ZTL scadenza',sub:'entro 30gg'}];
  statItems.forEach(function(c){
    h+='<div style="background:'+c.bg+';border-radius:var(--radius);padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;border:1px solid rgba(255,255,255,.08);">'+
      '<div style="font-size:22px;">'+c.ic+'</div>'+
      '<div><div style="font-size:20px;font-weight:800;color:#fff;line-height:1;">'+c.n+'</div>'+
      '<div style="font-size:10px;color:#93c5fd;margin-top:1px;">'+c.l+'</div></div></div>';});
  h+='</div>';

  // Grafico barre distribuzione per sede
  var cnt={};fl.forEach(function(v){var s=v.SEDE||'Altro';cnt[s]=(cnt[s]||0)+1;});
  var sorted=Object.entries(cnt).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
  var mx=sorted[0]?sorted[0][1]:1;
  h+='<div class="sec-t" style="color:var(--navy2);">📊 Distribuzione per sede</div>';
  h+='<div style="background:var(--card);border-radius:var(--radius);border:1px solid var(--border);padding:12px;">';
  sorted.forEach(function(e){
    var pct=Math.round(e[1]/mx*100);
    h+='<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">'+
      '<span style="font-weight:600;color:var(--text);">'+esc(e[0])+'</span>'+
      '<span style="color:var(--muted);">'+e[1]+'</span></div>'+
      '<div style="height:7px;background:var(--border);border-radius:99px;overflow:hidden;">'+
      '<div style="width:'+pct+'%;height:100%;background:var(--accent);border-radius:99px;transition:.6s;"></div></div></div>';});
  h+='</div>';
  el.innerHTML=h;}


// MANUTENZIONI// MANUTENZIONI
function renderManut(){
  var el=$id('tab-manut');if(!el)return;
  var off=S.fleet.filter(function(v){return (S.runtime[v.TARGA]||{}).stato==='Officina';});
  var ztlE=S.fleet.filter(function(v){return getZTL(v.TARGA).some(function(z){return ztlExpiring(z.scadenza);});});
  var h='<div class="sec-t">🔧 In officina ('+off.length+')</div>';
  h+=off.length?'<div class="vtable-wrap"><div style="overflow-x:auto;"><table class="vtable"><thead><tr><th>TARGA</th><th>MODELLO</th><th>SEDE</th><th>OFFICINA</th></tr></thead><tbody>'+off.map(function(v){var rt=S.runtime[v.TARGA]||{};return '<tr onclick="openVeh(\''+esc(v.TARGA)+'\')" style="cursor:pointer;"><td class="tg">'+esc(v.TARGA)+'</td><td class="mod">'+esc(v.TIPO_VEICOLO||'—')+'</td><td>'+esc(v.SEDE||'—')+'</td><td>'+esc(rt.officina||'—')+'</td></tr>';}).join('')+'</tbody></table></div></div>':'<div class="empty"><div class="ei">✅</div><h4>Nessun veicolo in officina</h4></div>';
  h+='<div class="sec-t" style="margin-top:10px;">🏙 ZTL in scadenza ('+ztlE.length+')</div>';
  h+=ztlE.length?'<div class="vtable-wrap"><div style="overflow-x:auto;"><table class="vtable"><thead><tr><th>TARGA</th><th>MODELLO</th><th>CITTÀ</th><th>SCADENZA</th></tr></thead><tbody>'+ztlE.map(function(v){return getZTL(v.TARGA).filter(function(z){return ztlExpiring(z.scadenza);}).map(function(z){return '<tr onclick="openVeh(\''+esc(v.TARGA)+'\')" style="cursor:pointer;"><td class="tg">'+esc(v.TARGA)+'</td><td class="mod">'+esc(v.TIPO_VEICOLO||'—')+'</td><td>'+esc(z.citta)+'</td><td style="color:#dc2626;font-weight:700;">'+esc(z.scadenza)+'</td></tr>';}).join('');}).join('')+'</tbody></table></div></div>':'<div class="empty"><div class="ei">✅</div><h4>Nessuna ZTL in scadenza</h4></div>';
  el.innerHTML=h;}

