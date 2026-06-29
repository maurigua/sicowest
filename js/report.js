/* report.js — SicOvest Next V49 */
// REPORT / SEGNALAZIONE
var RCFG={
  tagliando:{title:'🔧 Tagliando',emoji:'🔧',color:'#2563eb',askBlocking:false,blocking:true,scortaObb:false},
  guasto:{title:'⚠️ Guasto',emoji:'⚠️',color:'#c2410c',askBlocking:true,blocking:false,scortaObb:false},
  incidente:{title:'🚨 Incidente',emoji:'🚨',color:'#991b1b',askBlocking:false,blocking:true,scortaObb:true}};

function openRep(targa){
  if(S.isAdmin||S.isVisual||S.isGuest)return;
  S.curTarga=targa;S.scortaSel=null;
  var v=S.fleet.find(function(x){return x.TARGA===targa;});
  var h='<div class="sec-t">Seleziona tipo segnalazione</div>';
  h+='<div style="font-size:11px;color:var(--muted);margin-bottom:12px;">Veicolo: <strong>'+esc(targa)+'</strong></div>';
  Object.entries(RCFG).forEach(function(e){
    var k=e[0],c=e[1];
    h+='<div style="background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.2s;" onclick="selRepType(\''+k+'\')" onmouseover="this.style.borderColor=\''+c.color+'\'" onmouseout="this.style.borderColor=\'var(--border)\'">'+
      '<div style="font-size:22px;">'+c.emoji+'</div>'+
      '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+c.title+'</div>'+
      '<div style="font-size:11px;color:var(--muted);">'+(k==='tagliando'?'Auto in officina, sostitutiva opzionale':k==='guasto'?'Segnala guasto (bloccante o meno)':'Incidente, sostitutiva obbligatoria')+'</div></div>'+
      '<div style="color:var(--muted2);">›</div></div>';});
  $id('rep-title').textContent='📋 Nuova Segnalazione';
  $id('rep-body').innerHTML=h;$id('rep-send').style.display='none';
  closeOv('ov-veh');openOv('ov-rep');}

function selRepType(type){
  S.repType=type;S.scortaSel=null;var cfg=RCFG[type];
  var h='<div style="background:'+cfg.color+'11;border:1px solid '+cfg.color+'33;border-radius:var(--radius-sm);padding:10px;margin-bottom:12px;"><div style="font-weight:700;color:'+cfg.color+';">'+cfg.title+'</div><div style="font-size:11px;color:var(--muted);">'+esc(S.curTarga)+'</div></div>';
  if(cfg.askBlocking){h+='<div class="fg"><label class="fl">Gravità</label><select class="fi" id="rep-bl" onchange="updRepScorta()"><option value="no">⚠️ Non bloccante (auto ancora usabile)</option><option value="si">🔴 Bloccante (auto ferma)</option></select></div>';}
  h+='<div class="fg"><label class="fl">Descrizione</label><textarea class="fi" id="rep-desc" rows="3" placeholder="Descrivi..."></textarea></div>';
  if(type==='incidente'){h+='<div class="fg"><label class="fl">Posizione GPS</label><div style="display:flex;gap:7px;"><input class="fi" id="rep-pos" placeholder="In attesa..." readonly style="flex:1;"><button class="btn btn-g" onclick="getGPS()" style="padding:7px 10px;font-size:11px;">📍 GPS</button></div></div>';}
  h+='<div id="rep-scorta-wrap">'+bldScorta(type,cfg)+'</div>';
  $id('rep-body').innerHTML=h;$id('rep-send').style.display='';}

function bldScorta(type,cfg){
  if(!cfg)cfg=RCFG[type]||{};
  var bl=cfg.askBlocking?($id('rep-bl')&&$id('rep-bl').value==='si'):cfg.blocking;
  if(!bl&&type==='guasto')return '';
  var uV=S.fleet.find(function(v){var a=getAss(v.TARGA);return a&&p8(a.cid)===p8(S.user.cid);});
  var uSede=uV?uV.SEDE:'';
  var sc=S.fleet.filter(function(v){
    var ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
    return ut==='SCORTA'&&!rt.assegnato_a&&rt.stato!=='Officina';
  }).sort(function(a,b){var sa=a.SEDE===uSede,sb=b.SEDE===uSede;return sa===sb?0:sa?-1:1;}).slice(0,6);
  var lbl=cfg.scortaObb?'🔄 Sostitutiva (obbligatoria)':'🔄 Sostitutiva (opzionale)';
  var h='<div class="fg"><label class="fl">'+lbl+'</label>';
  if(!sc.length){h+='<div style="background:#fee2e2;border:1px solid #fecaca;border-radius:var(--radius-sm);padding:9px;font-size:11px;color:#991b1b;">⚠️ Nessuna scorta disponibile</div>';}
  else{h+='<select class="fi" id="rep-sc" onchange="S.scortaSel=this.value"><option value="">— Nessuna —</option>';sc.forEach(function(v){h+='<option value="'+esc(v.TARGA)+'">'+esc(v.TARGA)+' – '+esc(v.SEDE||'')+'</option>';});h+='</select>';}
  return h+'</div>';}

function updRepScorta(){var w=$id('rep-scorta-wrap');if(w)w.innerHTML=bldScorta(S.repType);}

function getGPS(){
  if(!navigator.geolocation){toast('GPS non disponibile',true);return;}
  toast('📍 Rilevamento...');
  navigator.geolocation.getCurrentPosition(function(pos){var el=$id('rep-pos');if(el)el.value=pos.coords.latitude.toFixed(6)+','+pos.coords.longitude.toFixed(6);toast('✅ Posizione rilevata',false,true);},function(){toast('GPS non disponibile',true);});}

function sendReport(){
  var tg=S.curTarga,cfg=RCFG[S.repType];if(!cfg)return;
  var desc=($id('rep-desc')&&$id('rep-desc').value.trim())||'';
  var pos=($id('rep-pos')&&$id('rep-pos').value.trim())||'';
  var sc=($id('rep-sc')&&$id('rep-sc').value)||S.scortaSel||'';
  var bl=cfg.askBlocking?($id('rep-bl')&&$id('rep-bl').value==='si'):cfg.blocking;
  if(!S.runtime[tg])S.runtime[tg]={};
  S.runtime[tg].stato=(S.repType==='tagliando'||bl)?'Officina':'Marciante';
  if(sc){if(!S.runtime[sc])S.runtime[sc]={};S.runtime[sc].assegnato_a={cid:S.user.cid,cognome:S.user.cognome,nome:S.user.nome};S.runtime[sc].rilasciato=false;}
  var tkt={id:'TK'+Date.now(),targa:tg,tipo:S.repType,cid:S.user.cid,cognome:S.user.cognome,nome:S.user.nome,stato:'APERTO',bloccante:bl,testo:desc,posizione:pos,scortaTarga:sc,data:today()};
  S.tickets.unshift(tkt);
  if(desc)S.notes.push({ID_NOTA:'N'+Date.now(),TARGA:tg,TESTO:cfg.emoji+' '+desc+(pos?' GPS:'+pos:''),DATA:today(),CID_AUTORE:S.user.cid});
  pushGAS('report',tkt,null);saveLocal();closeAll();toast('✅ Ticket '+tkt.id+' creato',false,true);renderApp();}

function rilascia(tg){
  confirm2('Rilasciare scorta '+tg+'?','Il veicolo tornerà disponibile.',function(){
    if(S.runtime[tg]){S.runtime[tg].assegnato_a=null;S.runtime[tg].rilasciato=true;}
    pushGAS('release_scorta',{targa:tg,data:today()},null);saveLocal();toast('↩️ Scorta rilasciata',false,true);renderApp();});}

// TICKET
function renderTicket(){
  var el=$id('tab-ticket');if(!el)return;
  var tkts=S.tickets;if(!S.isAdmin)tkts=tkts.filter(function(t){return t.cid===S.user.cid;});
  if(!tkts.length){el.innerHTML='<div class="empty"><div class="ei">🎫</div><h4>Nessun ticket</h4></div>';return;}
  el.innerHTML=tkts.map(function(t){
    var ic=t.tipo==='incidente'?'🚨':t.tipo==='guasto'?'⚠️':'🔧';
    var sc=t.stato==='APERTO'?'#dc2626':'#16a34a';
    return '<div class="tc"><div class="ti">'+ic+'</div><div style="flex:1;"><div class="tt" style="cursor:pointer;" onclick="openVeh(\''+esc(t.targa)+'\')">'+esc(t.targa)+'</div><div class="ttype">'+esc(t.tipo.toUpperCase())+(t.bloccante?' 🔴':'')+'</div><div class="tdesc">'+esc(t.testo||'—')+'</div>'+(t.scortaTarga?'<div style="font-size:10px;color:var(--accent);">🚗 Scorta: '+esc(t.scortaTarga)+'</div>':'')+'<div class="tmeta">'+esc(t.cognome||'')+' — '+esc(t.data||'')+' | <span style="color:'+sc+';font-weight:700;">'+t.stato+'</span></div></div>'+(S.isAdmin?'<button class="ab" style="background:#d1fae5;color:#065f46;border-color:#a7f3d0;white-space:nowrap;" onclick="closeTkt(\''+t.id+'\')">✅ Chiudi</button>':'')+'</div>';}).join('');}

function closeTkt(id){
  if(!S.isAdmin)return;var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;
  t.stato='CHIUSO';
  var other=S.tickets.filter(function(x){return x.targa===t.targa&&x.stato==='APERTO'&&x.id!==id;});
  if(!other.length&&S.runtime[t.targa])S.runtime[t.targa].stato='Marciante';
  pushGAS('close_ticket',{id:id,data:today()},null);saveLocal();toast('✅ Ticket chiuso',false,true);renderTicket();updateTktBadge();}

