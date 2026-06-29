/* sync.js — SicOvest Next V49 */
function loadData(src){
  var d=src||DB;
  S.fleet=d.VEICOLI||[];S.persons=d.PERSONE||[];S.assignments=d.ASSEGNAZIONI||[];
  S.utilizzi=d.UTILIZZI||[];S.ep=d.EASYPARK||[];S.ztl=d.ZTL||[];
  S.notes=d.NOTE_OPERATIVE||[];S.cancelled=d.TARGHE_CANCELLATE||[];}

function saveLocal(){
  try{localStorage.setItem(LKEY,JSON.stringify({
    fleet:S.fleet,persons:S.persons,assignments:S.assignments,
    utilizzi:S.utilizzi,ep:S.ep,ztl:S.ztl,notes:S.notes,
    cancelled:S.cancelled,runtime:S.runtime,tickets:S.tickets,
    bookings:S.bookings,ts:Date.now()}));}catch(e){}}

function loadLocal(){
  try{
    var r=localStorage.getItem(LKEY);if(!r)return false;
    var d=JSON.parse(r);if(!d.fleet||!d.fleet.length)return false;
    if(Date.now()-d.ts>86400000)return false;
    S.fleet=d.fleet||[];S.persons=d.persons||[];S.assignments=d.assignments||[];
    S.utilizzi=d.utilizzi||[];S.ep=d.ep||[];S.ztl=d.ztl||[];
    S.notes=d.notes||[];S.cancelled=d.cancelled||[];
    S.runtime=d.runtime||{};S.tickets=d.tickets||[];S.bookings=d.bookings||[];
    S.lastSync=new Date(d.ts);return true;}
  catch(e){return false;}}

// SYNC
function doSync(silent,cb){
  if(!GAS_URL){if(cb)cb(false);return;}
  syncBar('🔄 Sincronizzazione...');
  var tb=$id('tb-sync');if(tb)tb.className='syncing';
  var sheets=['VEICOLI','PERSONE','ASSEGNAZIONI','UTILIZZI','EASYPARK','ZTL','NOTE_OPERATIVE','TARGHE_CANCELLATE'];
  var res={};var pend=sheets.length;var err=false;
  sheets.forEach(function(sh){
    fetch(GAS_URL+'?sheet='+encodeURIComponent(sh)+'&ts='+Date.now(),{method:'GET',mode:'cors'})
      .then(function(r){return r.json();})
      .then(function(data){res[sh]=Array.isArray(data)?data:(data&&data.values?data.values:[]);})
      .catch(function(){err=true;res[sh]=S[sh2key(sh)]||[];})
      .finally(function(){
        if(--pend===0){
          if(!err){
            if(res.VEICOLI&&res.VEICOLI.length)S.fleet=res.VEICOLI;
            if(res.PERSONE&&res.PERSONE.length)S.persons=res.PERSONE;
            if(res.ASSEGNAZIONI&&res.ASSEGNAZIONI.length)S.assignments=res.ASSEGNAZIONI;
            if(res.UTILIZZI&&res.UTILIZZI.length)S.utilizzi=res.UTILIZZI;
            if(res.EASYPARK&&res.EASYPARK.length)S.ep=res.EASYPARK;
            if(res.ZTL&&res.ZTL.length)S.ztl=res.ZTL;
            if(res.NOTE_OPERATIVE&&res.NOTE_OPERATIVE.length)S.notes=res.NOTE_OPERATIVE;
            if(res.TARGHE_CANCELLATE&&res.TARGHE_CANCELLATE.length)S.cancelled=res.TARGHE_CANCELLATE;
            S.lastSync=new Date();saveLocal();syncBar('✅ Sincronizzato — '+nowStr(),'ok');}
          else{
            if(!S.fleet.length)loadData(DB);
            syncBar('📴 Offline — dati embedded attivi','err');}
          renderApp();
          if(tb)tb.className='';if(cb)cb(!err);}});}); }

function pushGAS(action,payload,cb){
  if(!GAS_URL){if(cb)cb(false);return;}
  syncBar('💾 Salvataggio...');
  var body=JSON.stringify({action:action,payload:payload,ts:Date.now()});
  fetch(GAS_URL,{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},body:body})
    .then(function(r){return r.json();})
    .then(function(res){syncBar(res.ok?'✅ Salvato':'⚠️ Errore',res.ok?'ok':'err');saveLocal();if(cb)cb(res.ok);})
    .catch(function(){
      fetch(GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body})
        .then(function(){syncBar('💾 Salvato (fallback)','ok');saveLocal();if(cb)cb(true);})
        .catch(function(){syncBar('❌ Errore salvataggio','err');saveLocal();if(cb)cb(false);});});}

function sh2key(s){return{VEICOLI:'fleet',PERSONE:'persons',ASSEGNAZIONI:'assignments',
  UTILIZZI:'utilizzi',EASYPARK:'ep',ZTL:'ztl',NOTE_OPERATIVE:'notes',TARGHE_CANCELLATE:'cancelled'}[s]||'';}

