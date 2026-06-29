/* fleet.js — SicOvest Next V49 */
// FILTER
function setFilter(f){
  S.filter=f;S.page=0;
  document.querySelectorAll('.fbtn').forEach(function(b){b.className='fbtn'+(b.id==='f-'+f?' active':'');});
  renderFlotta();}

var _sT=null;
function onSearch(val){S.query=val.trim().toLowerCase();S.page=0;var cl=$id('search-clear');if(cl)cl.style.display=val?'flex':'none';clearTimeout(_sT);_sT=setTimeout(renderFlotta,280);}
function clearSearch(){S.query='';S.page=0;var si=$id('search-input');if(si)si.value='';var cl=$id('search-clear');if(cl)cl.style.display='none';renderFlotta();}

function filterFleet(){
  var f=S.filter,q=S.query,uCid=S.user?S.user.cid:'';
  var list=S.fleet.filter(function(v){
    if(!S.isAdmin&&!S.isVisual&&!S.isGuest){
      var a=getAss(v.TARGA),ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
      if(ut==='SCORTA'&&rt.assegnato_a&&rt.assegnato_a.cid===uCid)return true;
      return a&&p8(a.cid)===p8(uCid);}
    var ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
    var spec=(v.VEICOLO_SPECIALE||'').toUpperCase()==='SI'||ut==='SPECIALI';
    if(f==='assegnati'){if(spec||ut==='SCORTA'||ut==='TECNICO'||rt.stato==='Officina')return false;}
    if(f==='scorta')return ut==='SCORTA';
    if(f==='tecnico')return ut==='TECNICO';
    if(f==='speciali')return spec;
    if(f==='officina')return rt.stato==='Officina';
    return true;});
  if(q)list=list.filter(function(v){
    var a=getAss(v.TARGA),n=a?(a.cognome+' '+a.nome).toLowerCase():'';
    return v.TARGA.toLowerCase().includes(q)||(v.TIPO_VEICOLO||'').toLowerCase().includes(q)||(v.SEDE||'').toLowerCase().includes(q)||n.includes(q)||(a&&a.cid&&a.cid.includes(q));});
  if(S.sortF)list.sort(function(a,b){
    var va='',vb='';
    if(S.sortF==='targa'){va=a.TARGA;vb=b.TARGA;}
    else if(S.sortF==='sede'){va=a.SEDE||'';vb=b.SEDE||'';}
    else if(S.sortF==='modello'){va=a.TIPO_VEICOLO||'';vb=b.TIPO_VEICOLO||'';}
    else if(S.sortF==='assegnatario'){var aa=getAss(a.TARGA),ab=getAss(b.TARGA);va=aa?aa.cognome:'';vb=ab?ab.cognome:'';}
    return va.localeCompare(vb)*S.sortD;});
  return list;}

function sortBy(f){if(S.sortF===f)S.sortD*=-1;else{S.sortF=f;S.sortD=1;}renderFlotta();}

// RENDER FLOTTA
function renderFlotta(){
  var list=filterFleet(),total=list.length;
  var pages=Math.ceil(total/PAGE_SZ)||1;
  if(S.page>=pages)S.page=pages-1;
  var pg=list.slice(S.page*PAGE_SZ,(S.page+1)*PAGE_SZ);
  var cnt=$id('vtable-count');if(cnt)cnt.textContent=total+' veicoli';
  var canAct=!S.isVisual&&!S.isGuest;
  var uCid=S.user?S.user.cid:'';
  var rows=pg.map(function(v){
    var a=getAss(v.TARGA),ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
    var ep=hasEP(v.TARGA),ztlL=getZTL(v.TARGA);
    var peni=v.PIN_ENILIVE||'',pq8=v.PIN_Q8||'';
    var tg=v.TARGA;
    var assH=a?'<div class="asshn"><div class="an">'+esc(a.cognome)+' '+esc(a.nome)+'</div><div class="ac">'+esc(a.cid)+'</div></div>':'<span style="color:var(--muted2);font-size:11px;">—</span>';
    var pEniH=peni?'<span class="pin-box" onclick="cpPin(\''+esc(peni)+'\')">'+esc(peni)+'</span>':'<span style="color:var(--muted2)">—</span>';
    var pQ8H=pq8?'<span class="pin-box" onclick="cpPin(\''+esc(pq8)+'\')">'+esc(pq8)+'</span>':'<span style="color:var(--muted2)">—</span>';
    var tktN=S.tickets.filter(function(t){return t.targa===tg&&t.stato==='APERTO';}).length;
    var tktInd=tktN?'<span style="color:#dc2626;font-size:9px;font-weight:800;"> 🔴'+tktN+'</span>':'';
    var actH='';
    if(canAct){
      actH='<td>';
      if(S.isAdmin){actH+='<button class="ab ab-edit" onclick="event.stopPropagation();openEV(\''+tg+'\')">✏️</button><button class="ab" style="background:#d1fae5;color:#065f46;border-color:#a7f3d0;" onclick="event.stopPropagation();openDocs(\''+tg+'\')">📄</button>';}
      if(!S.isAdmin){actH+='<button class="ab ab-rep" onclick="event.stopPropagation();openRep(\''+tg+'\')">⚠️</button>';}
      if(!S.isAdmin&&rt.assegnato_a&&rt.assegnato_a.cid===uCid){actH+='<button class="ab ab-rel" onclick="event.stopPropagation();rilascia(\''+tg+'\')">↩️</button>';}
      actH+='</td>';}
    return '<tr onclick="openVeh(\''+tg+'\')" style="cursor:pointer;">'+
      '<td class="tg">'+esc(tg)+tktInd+'</td>'+
      '<td class="mod" title="'+esc(v.TIPO_VEICOLO||'')+'">'+esc((v.TIPO_VEICOLO||'—').substring(0,30))+'</td>'+
      '<td>'+assH+'</td>'+
      '<td style="font-size:11px;color:var(--muted);">'+esc(v.SEDE||'—')+'</td>'+
      '<td>'+badgeTipo(v)+'</td>'+
      '<td><span class="dot '+(ep?'dot-g':'dot-x')+'" title="'+(ep?'EasyPark attivo':'—')+'"></span></td>'+
      '<td><span class="dot '+(ztlL.length?'dot-g':'dot-x')+'"></span></td>'+
      '<td>'+pEniH+'</td><td>'+pQ8H+'</td>'+
      (canAct?actH:'')+
    '</tr>';}).join('');
  var tb=$id('vtable-body');
  if(tb)tb.innerHTML=rows||'<tr><td colspan="10"><div class="empty"><div class="ei">🔍</div><h4>Nessun veicolo trovato</h4><p>Modifica filtri o ricerca</p></div></td></tr>';
  renderPag(pages,total);}

function renderPag(pages,total){
  var el=$id('pagination');if(!el||pages<=1){if(el)el.innerHTML='';return;}
  var s=S.page*PAGE_SZ+1,e=Math.min((S.page+1)*PAGE_SZ,total);
  var h='<button class="pgb" onclick="goPg(0)" '+(S.page===0?'disabled':'')+'>«</button>';
  h+='<button class="pgb" onclick="goPg(S.page-1)" '+(S.page===0?'disabled':'')+'>‹</button>';
  for(var i=Math.max(0,S.page-2);i<=Math.min(pages-1,S.page+2);i++)h+='<button class="pgb'+(i===S.page?' active':'')+'" onclick="goPg('+i+')">'+(i+1)+'</button>';
  h+='<button class="pgb" onclick="goPg(S.page+1)" '+(S.page===pages-1?'disabled':'')+'>›</button>';
  h+='<button class="pgb" onclick="goPg('+(pages-1)+')" '+(S.page===pages-1?'disabled':'')+'>»</button>';
  h+='<span id="pg-info">'+s+'–'+e+'/'+total+'</span>';
  el.innerHTML=h;}

function goPg(p){var l=filterFleet();S.page=Math.max(0,Math.min(p,Math.ceil(l.length/PAGE_SZ)-1));renderFlotta();window.scrollTo(0,180);}

function cpPin(pin){navigator.clipboard?navigator.clipboard.writeText(pin).then(function(){toast('📋 '+pin,false,true);}):toast(pin);}

