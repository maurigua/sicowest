/* settings.js — SicOvest Next V49 */
// IMPOSTAZIONI
function renderImpost(){
  var el=$id('tab-impost');if(!el)return;
  var si=S.lastSync?'Ultimo sync: '+S.lastSync.toLocaleString('it-IT'):'Mai sincronizzato';
  var h='';
  if(S.isAdmin){
    h+='<div class="ss"><div class="ssh">👑 Amministrazione</div>'+
      '<div class="sr" onclick="openGestioneCid()"><div class="sri" style="background:#dbeafe;">👤</div><div><div class="srt">Anagrafiche CID</div><div class="srs">'+S.persons.length+' registrate</div></div><div class="sra">›</div></div>'+
      '<div class="sr" onclick="openOv(\'ov-swap\')"><div class="sri" style="background:#fef3c7;">🔀</div><div><div class="srt">Swap rapido</div><div class="srs">Scambia assegnazioni</div></div><div class="sra">›</div></div>'+
      '<div class="sr" onclick="openLogOv()"><div class="sri" style="background:#f0fdf4;">📋</div><div><div class="srt">Log attività</div><div class="srs">Cronologia operazioni</div></div><div class="sra">›</div></div>'+
      '<div class="sr" onclick="switchTab(\'manut\')"><div class="sri" style="background:#fee2e2;">🔧</div><div><div class="srt">Manutenzioni</div><div class="srs">Officina e ZTL</div></div><div class="sra">›</div></div></div>';}
  h+='<div class="ss"><div class="ssh">🔄 Sync & Docs</div>'+
    '<div class="sr" onclick="doSync()"><div class="sri" style="background:#dbeafe;">🔄</div><div><div class="srt">Sincronizza ora</div><div class="srs">'+si+'</div></div></div>'+
    '<div class="sr" onclick="openGDrive()"><div class="sri" style="background:#d1fae5;">📂</div><div><div class="srt">Google Drive</div><div class="srs">PDF documenti flotta</div></div><div class="sra">↗️</div></div></div>';
  h+='<div class="ss"><div class="ssh">ℹ️ Info</div>'+
    '<div class="sr"><div class="sri" style="background:#f8fafc;">📱</div><div><div class="srt">SicOvest Next V49</div><div class="srs">'+S.fleet.length+' veicoli | '+si+'</div></div></div>'+
    '<div class="sr" onclick="doLogout()"><div class="sri" style="background:#fee2e2;">🚪</div><div><div class="srt">Esci</div></div></div></div>';
  el.innerHTML=h;}

// SWAP
function doSwap(){
  var a=$id('sw-a').value.toUpperCase().trim(),b=$id('sw-b').value.toUpperCase().trim();
  var note=$id('sw-note').value.trim();
  if(!a||!b){toast('Inserisci entrambe le targhe',true);return;}
  if(a===b){toast('Le targhe devono essere diverse',true);return;}
  if(!S.fleet.find(function(v){return v.TARGA===a;})){toast('Targa '+a+' non trovata',true);return;}
  if(!S.fleet.find(function(v){return v.TARGA===b;})){toast('Targa '+b+' non trovata',true);return;}
  var aA=S.assignments.find(function(x){return x.TARGA===a&&(x.ATTIVA||'').toUpperCase()==='SI';});
  var bA=S.assignments.find(function(x){return x.TARGA===b&&(x.ATTIVA||'').toUpperCase()==='SI';});
  var cA=aA?aA.CID:'',cB=bA?bA.CID:'';
  if(aA)aA.CID=cB||aA.CID;if(bA)bA.CID=cA||bA.CID;
  if(!cB&&aA)aA.ATTIVA='NO';if(!cA&&bA)bA.ATTIVA='NO';
  actLog('swap','Swap '+a+' ↔ '+b+(note?' — '+note:''));
  pushGAS('swap',{targaA:a,targaB:b,cidA:cA,cidB:cB,note:note,data:today()},null);
  saveLocal();closeOv('ov-swap');toast('🔀 Swap '+a+' ↔ '+b+' eseguito',false,true);renderApp();}

// DOCS
function openDocs(targa){
  S.curTarga=targa;$id('docs-targa').textContent=targa;
  var docs=[{icon:'🛡',n:'Assicurazione'},{icon:'📋',n:'Carta di circolazione'},{icon:'🔧',n:'Libretto tagliando'},{icon:'🏙',n:'Permesso ZTL'}];
  $id('docs-body').innerHTML='<p style="font-size:11px;color:var(--muted);margin-bottom:10px;">I documenti sono archiviati su Google Drive. Usa il tasto "Apri Drive" per caricare o visualizzare PDF.</p>'+
    '<div class="ss">'+docs.map(function(d){return '<div class="doc-row"><div class="di">'+d.icon+'</div><div><div class="dn">'+d.n+'</div><div class="dd">Google Drive</div></div><div style="margin-left:auto;"><button class="ab ab-edit" onclick="openGDrive()">📂 Drive</button></div></div>';}).join('')+'</div>';
  openOv('ov-docs');}

function openGDrive(){window.open(GDRIVE,'_blank');}

// LOG
var _log=[];
function actLog(action,desc){_log.unshift({a:action,d:desc,u:S.user?S.user.cid:'',t:nowStr()});if(_log.length>100)_log.pop();}
function openLogOv(){
  var d=document.createElement('div');d.className='ov show';
  d.innerHTML='<div class="ovb" style="max-width:500px;"><div class="ovh"><h3>📋 Log Attività</h3><button class="ovc" onclick="this.closest(\'.ov\').remove()">✕</button></div>'+
    '<div class="ovbd" style="max-height:55vh;overflow-y:auto;">'+(_log.length?_log.map(function(l){return '<div style="padding:7px 0;border-bottom:1px solid #f1f5f9;"><div style="font-size:12px;font-weight:600;">'+esc(l.d)+'</div><div style="font-size:10px;color:var(--muted);margin-top:1px;">'+esc(l.u)+' — '+esc(l.t)+'</div></div>';}).join(''):'<div class="empty"><div class="ei">📋</div><h4>Nessuna attività</h4></div>')+'</div>'+
    '<div class="ovft"><button class="btn btn-g" onclick="this.closest(\'.ov\').remove()">Chiudi</button></div></div>';
  document.body.appendChild(d);}

// QUICK ACTIONS
function openQuickActions(){
  var items=[];
  if(S.isAdmin){items.push({i:'🔀',l:'Swap rapido',f:"openOv('ov-swap')"});items.push({i:'👤',l:'Gestione CID',f:"openGestioneCid()"});items.push({i:'📋',l:'Reports',f:"switchTab('reports')"});items.push({i:'🔧',l:'Manutenzioni',f:"switchTab('manut')"});}
  items.push({i:'🔄',l:'Sincronizza',f:"doSync()"});items.push({i:'📂',l:'Google Drive',f:"openGDrive()"});items.push({i:'📷',l:'Scanner QR',f:"openQR()"});
  $id('qa-body').innerHTML=items.map(function(it){return '<div class="sr" onclick="closeOv(\'ov-qa\');'+it.f+'"><div class="sri" style="background:#eff6ff;font-size:17px;">'+it.i+'</div><div><div class="srt">'+it.l+'</div></div></div>';}).join('');
  openOv('ov-qa');}

// QR
function openQR(){
  openOv('ov-qr');var v=$id('qr-video');
  navigator.mediaDevices&&navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
    .then(function(s){S.qrStream=s;v.srcObject=s;})
    .catch(function(){toast('Fotocamera non disponibile',true);closeOv('ov-qr');});}
function closeQR(){if(S.qrStream){S.qrStream.getTracks().forEach(function(t){t.stop();});S.qrStream=null;}closeOv('ov-qr');}

// CONFIRM
function confirm2(title,msg,onOk){
  $id('conf-t').textContent=title;$id('conf-msg').textContent=msg;
  var btn=$id('conf-ok');btn.onclick=function(){closeOv('ov-conf');onOk();};openOv('ov-conf');}

function toggleMenu(){var o=$id('ov-menu');if(o.className.includes('show'))closeOv('ov-menu');else openOv('ov-menu');}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeAll();
  if((e.metaKey||e.ctrlKey)&&e.key==='f'){e.preventDefault();var si=$id('search-input');if(si){si.focus();si.select();}}});

// INIT
(function(){
  if(!loadLocal()||!S.fleet.length)loadData(DB);
  if(!S.fleet.length)loadData(DB); // doppio check per sicurezza
  popSediGuest();
  ['l-cid','l-pin'].forEach(function(id){var el=$id(id);if(el)el.addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});});
  var ll=$id('login-logo');if(ll)ll.src=LOGO_SRC;
})();

