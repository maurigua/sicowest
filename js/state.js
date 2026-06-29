/* state.js — SicOvest Next V49 */
var S={user:null,isAdmin:false,isVisual:false,isGuest:false,
  fleet:[],persons:[],assignments:[],utilizzi:[],ep:[],ztl:[],notes:[],
  cancelled:[],runtime:{},tickets:[],bookings:[],
  filter:'tutti',query:'',page:0,sortF:'',sortD:1,
  curTarga:null,editPIdx:-1,repType:null,scortaSel:null,
  lastSync:null,arTimer:null,evZtl:[],qrStream:null};

function p8(v){return String(v||'').replace(/\D/g,'').padStart(8,'0');}
function p4(v){return String(v||'').replace(/\D/g,'').padStart(4,'0');}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function today(){return new Date().toLocaleDateString('it-IT');}
function nowStr(){return new Date().toLocaleString('it-IT');}
function $id(id){return document.getElementById(id);}

function toast(msg,isErr,isOk){
  var t=$id('toast');t.textContent=msg;
  t.className='show'+(isErr?' err':isOk?' ok':'');
  clearTimeout(t._t);t._t=setTimeout(function(){t.className='';},3200);}

function syncBar(msg,st){
  var b=$id('sync-bar');$id('sync-msg').textContent=msg;
  b.className='show'+(st?' '+st:'');
  if(st==='ok'||st==='err'){clearTimeout(b._t);b._t=setTimeout(function(){b.className='';},2800);}}

function showLoad(msg){$id('loading').className='show';$id('loading-msg').textContent=msg||'Caricamento...';}
function hideLoad(){$id('loading').className='';}
function openOv(id){$id(id).className='ov show';}
function closeOv(id){$id(id).className='ov';}
function closeAll(){document.querySelectorAll('.ov').forEach(function(o){o.className='ov';});}

function vPhoto(tipo){
  if(!tipo)return VP.doblo;
  var t=tipo.toLowerCase();
  if(t.includes('ducato')||t.includes('daily')||t.includes('iveco'))return VP.ducato;
  if(t.includes('panda'))return VP.panda;
  if(t.includes('caddy')||t.includes('volkswagen'))return VP.caddy;
  if(t.includes('fiorino'))return VP.fiorino;
  return VP.doblo;}

function getUT(targa){
  var u=S.utilizzi.find(function(x){return x.TARGA===targa&&(x.ATTIVO||'').toUpperCase()==='SI';});
  return u?u.TIPO_UTILIZZO:'';}

function getAss(targa){
  var a=S.assignments.find(function(x){return x.TARGA===targa&&(x.ATTIVA||'').toUpperCase()==='SI';});
  if(!a)return null;
  var p=S.persons.find(function(x){return x.CID===a.CID;});
  return {cid:a.CID,cognome:p?p.COGNOME:'',nome:p?p.NOME:''};}

function getZTL(targa){
  var z=S.ztl.find(function(x){return x.TARGA===targa;});
  if(!z)return [];
  var r=[];
  for(var i=1;i<=3;i++){var c=z['CITTA '+i];if(c&&c.trim())r.push({citta:c,scadenza:z['SCADENZA '+i]||'',tipo:z['TIPO_PERMESSO '+i]||''});}
  return r;}

function hasEP(targa){return S.ep.some(function(e){return e.TARGA===targa&&(e.ATTIVO||'').toUpperCase()==='SI';});}
function getNotes(targa){return S.notes.filter(function(n){return n.TARGA===targa;});}

function ztlExpiring(scad){
  if(!scad)return false;
  try{var p=scad.split('/');var d=new Date(+p[2],+p[1]-1,+p[0]);return (d-new Date())/86400000<=30&&(d-new Date())>=0;}
  catch(e){return false;}}

function badgeTipo(v){
  var ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
  if(rt.stato==='Officina')return '<span class="badge b-off">Officina</span>';
  if(ut==='SPECIALI'||(v.VEICOLO_SPECIALE||'').toUpperCase()==='SI')return '<span class="badge b-spec">Speciali</span>';
  if(ut==='TECNICO')return '<span class="badge b-tec">Tecnico</span>';
  if(ut==='SCORTA'){
    var ra=rt.assegnato_a;
    return ra?'<span class="badge b-scorta">Scorta▸'+esc(ra.cognome)+'</span>':'<span class="badge b-lib">Scorta libera</span>';}
  return '<span class="badge b-ass">Ass.</span>';}

