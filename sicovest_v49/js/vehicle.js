/* vehicle.js — SicOvest Next V49 */
// VEICOLO DETAIL
function openVeh(targa){
  var v=S.fleet.find(function(x){return x.TARGA===targa;});if(!v)return;
  S.curTarga=targa;
  var a=getAss(targa),rt=S.runtime[targa]||{},ut=getUT(targa);
  var ep=hasEP(targa),ztlL=getZTL(targa),notes=getNotes(targa);
  var tkt=S.tickets.filter(function(t){return t.targa===targa&&t.stato==='APERTO';});
  var ph=vPhoto(v.TIPO_VEICOLO),stato=rt.stato||'Marciante';
  var sc=stato==='Officina'?'#dc2626':stato==='Fuori servizio'?'#ea580c':'#16a34a';
  $id('vd-title').textContent='🚗 '+targa;
  var h='<div class="vdh"><img class="vph" src="'+ph+'" alt="'+esc(v.TIPO_VEICOLO||'')+'">';
  h+='<div><div class="vtb">'+esc(targa)+'</div><div class="vmb">'+esc(v.TIPO_VEICOLO||'Veicolo')+'</div>';
  h+='<div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap;">'+badgeTipo(v);
  h+='<span class="badge" style="background:'+sc+'22;color:'+sc+';">'+esc(stato)+'</span>';
  if(tkt.length)h+='<span class="badge b-red">🎫 '+tkt.length+'</span>';
  h+='</div></div></div>';
  h+='<div class="fi-row" style="gap:8px;margin-bottom:12px;">';
  h+=iF('Sede',v.SEDE||'—')+iF('Assegnatario',a?(a.cognome+' '+a.nome):(ut||'—'));
  if(a)h+=iF('CID',a.cid);h+='</div>';
  if(v.PIN_ENILIVE||v.PIN_Q8){
    h+='<div class="sec-t">⛽ Rifornimento</div><div class="fi-row" style="gap:8px;margin-bottom:12px;">';
    if(v.PIN_ENILIVE)h+='<div onclick="cpPin(\''+esc(v.PIN_ENILIVE)+'\')" style="cursor:pointer;background:var(--bg);border-radius:var(--radius-sm);padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:9px;color:var(--muted);margin-bottom:3px;text-transform:uppercase;">PIN ENI</div><div style="font-size:17px;font-weight:800;font-family:monospace;color:var(--navy2);">'+esc(v.PIN_ENILIVE)+'</div><div style="font-size:9px;color:var(--accent);">Tocca copia</div></div>';
    if(v.PIN_Q8)h+='<div onclick="cpPin(\''+esc(v.PIN_Q8)+'\')" style="cursor:pointer;background:var(--bg);border-radius:var(--radius-sm);padding:10px;text-align:center;border:1px solid var(--border);"><div style="font-size:9px;color:var(--muted);margin-bottom:3px;text-transform:uppercase;">PIN Q8</div><div style="font-size:17px;font-weight:800;font-family:monospace;color:var(--navy2);">'+esc(v.PIN_Q8)+'</div><div style="font-size:9px;color:var(--accent);">Tocca copia</div></div>';
    h+='</div>';}
  if(ep)h+='<div class="sec-t">🅿️ EasyPark</div><div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:var(--radius-sm);padding:9px 13px;margin-bottom:12px;font-size:12px;color:#065f46;font-weight:600;">✅ EasyPark attivo</div>';
  if(ztlL.length){
    h+='<div class="sec-t">🏙 ZTL</div><div style="margin-bottom:12px;">';
    ztlL.forEach(function(z){var ex=ztlExpiring(z.scadenza);h+='<div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg);border-radius:var(--radius-sm);margin-bottom:4px;border:1px solid var(--border);"><span style="font-size:12px;font-weight:600;">'+esc(z.citta)+'</span><span style="font-size:11px;color:'+(ex?'#dc2626':'var(--muted)')+';">'+(z.scadenza||'—')+(ex?' ⚠️':'')+'</span></div>';});
    h+='</div>';}
  if(notes.length){h+='<div class="sec-t">📝 Note</div>';notes.slice(0,3).forEach(function(n){h+='<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:var(--radius-sm);padding:7px 11px;margin-bottom:5px;font-size:11px;">'+esc(n.TESTO||'')+(n.DATA?'<div style="font-size:9px;color:var(--muted);margin-top:2px;">'+esc(n.DATA)+'</div>':'')+'</div>';});}
  if(tkt.length){h+='<div class="sec-t">🎫 Ticket aperti</div>';tkt.forEach(function(t){var ic=t.tipo==='incidente'?'🚨':t.tipo==='guasto'?'⚠️':'🔧';h+='<div class="tc"><div class="ti">'+ic+'</div><div style="flex:1;"><div class="tt">'+esc(t.tipo.toUpperCase())+'</div><div class="tdesc">'+esc(t.testo||'')+'</div><div class="tmeta">'+esc(t.cognome||'')+' — '+esc(t.data||'')+'</div></div>'+(S.isAdmin?'<button class="ab" style="background:#d1fae5;color:#065f46;border-color:#a7f3d0;" onclick="closeTkt(\''+t.id+'\')">✅</button>':'')+'</div>';});}
  $id('vd-body').innerHTML=h;
  var ft='';
  if(S.isAdmin){ft+='<button class="btn btn-g" onclick="openEV(\''+targa+'\')">✏️ Modifica</button>';ft+='<button class="btn btn-g" onclick="openDocs(\''+targa+'\')">📄 Docs</button>';}
  if(!S.isAdmin&&!S.isVisual&&!S.isGuest)ft+='<button class="btn btn-w" onclick="openRep(\''+targa+'\')">⚠️ Segnala</button>';
  ft+='<button class="btn btn-g" onclick="closeOv(\'ov-veh\')">Chiudi</button>';
  $id('vd-foot').innerHTML=ft;openOv('ov-veh');}

function iF(l,v){return '<div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:700;letter-spacing:.4px;margin-bottom:2px;">'+esc(l)+'</div><div style="font-size:12px;font-weight:600;">'+esc(v)+'</div></div>';}

// EDIT VEICOLO
function openEV(targa){
  if(!S.isAdmin)return;
  var v=S.fleet.find(function(x){return x.TARGA===targa;});if(!v)return;
  S.curTarga=targa;
  var a=getAss(targa),rt=S.runtime[targa]||{},ut=getUT(targa);
  $id('ev-tlabel').textContent=targa;
  $id('ev-cid').value=a?a.cid:'';$id('ev-cogn').value=a?a.cognome:'';$id('ev-nome').value=a?a.nome:'';
  $id('ev-sede').value=v.SEDE||'';$id('ev-peni').value=v.PIN_ENILIVE||'';$id('ev-pq8').value=v.PIN_Q8||'';
  $id('ev-pool').value=ut||'';$id('ev-stato').value=rt.stato||'Marciante';
  $id('ev-offic').value=rt.officina||'';$id('ev-note').value='';$id('ev-ep').checked=hasEP(targa);
  S.evZtl=getZTL(targa).map(function(z){return {citta:z.citta,scadenza:z.scadenza,tipo:z.tipo||'Standard'};});
  evRZtl();closeOv('ov-veh');openOv('ov-ev');}

function evOnCid(val){
  var cid=p8(val);var p=S.persons.find(function(x){return p8(x.CID)===cid;});
  $id('ev-cogn').value=p?p.COGNOME:'';$id('ev-nome').value=p?p.NOME:'';}

function evAddZtl(){S.evZtl.push({citta:'',scadenza:'',tipo:'Standard'});evRZtl();}
function evRZtl(){
  var el=$id('ev-ztl');if(!el)return;
  el.innerHTML=S.evZtl.map(function(z,i){
    return '<div class="ztl-row"><input class="fi" placeholder="Città" value="'+esc(z.citta)+'" oninput="S.evZtl['+i+'].citta=this.value" style="min-width:100px;">'+
      '<input class="fi" placeholder="Scadenza gg/mm/aaaa" value="'+esc(z.scadenza||'')+'" oninput="S.evZtl['+i+'].scadenza=this.value" style="max-width:150px;">'+
      '<div class="ztl-del" onclick="S.evZtl.splice('+i+',1);evRZtl()">🗑</div></div>';}).join('');}

function evSave(){
  var tg=S.curTarga,v=S.fleet.find(function(x){return x.TARGA===tg;});if(!v)return;
  var newCid=p8($id('ev-cid').value.trim()),sede=$id('ev-sede').value.trim();
  var peni=$id('ev-peni').value.trim(),pq8=$id('ev-pq8').value.trim();
  var pool=$id('ev-pool').value,stato=$id('ev-stato').value;
  var offic=$id('ev-offic').value.trim(),noteT=$id('ev-note').value.trim();
  var ep=$id('ev-ep').checked;
  v.SEDE=sede;if(peni)v.PIN_ENILIVE=peni;if(pq8)v.PIN_Q8=pq8;
  var eA=S.assignments.find(function(a){return a.TARGA===tg&&(a.ATTIVA||'').toUpperCase()==='SI';});
  if(newCid&&newCid!=='00000000'){if(eA){eA.CID=newCid;}else{S.assignments.push({ID_ASSEGNAZIONE:String(Date.now()),TARGA:tg,CID:newCid,DATA_INIZIO:today(),DATA_FINE:'31/12/25',ATTIVA:'SI'});}}
  else if(eA){eA.ATTIVA='NO';}
  var eU=S.utilizzi.find(function(u){return u.TARGA===tg&&(u.ATTIVO||'').toUpperCase()==='SI';});
  if(pool){if(eU)eU.TIPO_UTILIZZO=pool;else S.utilizzi.push({ID_UTILIZZO:String(Date.now()),TARGA:tg,CID:'',TIPO_UTILIZZO:pool,DATA_INIZIO:'',DATA_FINE:'',ATTIVO:'SI'});}
  else if(eU){eU.ATTIVO='NO';}
  if(!S.runtime[tg])S.runtime[tg]={};S.runtime[tg].stato=stato;S.runtime[tg].officina=offic;
  var eEP=S.ep.find(function(e){return e.TARGA===tg;});
  if(ep){if(eEP)eEP.ATTIVO='SI';else S.ep.push({TARGA:tg,ATTIVO:'SI',CODICE:'',NOTE:''});}
  else if(eEP){eEP.ATTIVO='NO';}
  S.ztl=S.ztl.filter(function(z){return z.TARGA!==tg;});
  if(S.evZtl.length){var zr={TARGA:tg};S.evZtl.slice(0,3).forEach(function(z,i){zr['CITTA '+(i+1)]=z.citta;zr['TIPO_PERMESSO '+(i+1)]=z.tipo||'Standard';zr['SCADENZA '+(i+1)]=z.scadenza||'';});S.ztl.push(zr);}
  if(noteT)S.notes.push({ID_NOTA:'N'+Date.now(),TARGA:tg,TESTO:noteT,DATA:today(),CID_AUTORE:S.user.cid});
  actLog('edit_vehicle','Mod. '+tg);pushGAS('update_vehicle',{targa:tg,sede:sede,cid:newCid,pin_eni:peni,pin_q8:pq8,pool:pool,stato:stato,ep:ep,ztl:S.evZtl,nota:noteT},null);
  saveLocal();closeOv('ov-ev');toast('✅ '+tg+' aggiornato',false,true);renderApp();}

function confirmDelV(){confirm2('Elimina '+S.curTarga+'?','Verrà spostato in TARGHE_CANCELLATE.',function(){delV(S.curTarga);});}
function delV(tg){
  var v=S.fleet.find(function(x){return x.TARGA===tg;});if(!v)return;
  S.cancelled.push(Object.assign({DATA_CANCELLAZIONE:today(),CID_AUTORE:S.user.cid},v));
  S.fleet=S.fleet.filter(function(x){return x.TARGA!==tg;});
  pushGAS('delete_vehicle',{targa:tg,data:today()},null);saveLocal();closeAll();toast('🗑 '+tg+' eliminato',true);renderApp();}

