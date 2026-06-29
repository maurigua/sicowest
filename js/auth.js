/* auth.js — SicOvest Next V49 */
// LOGIN
function loginTab(t){
  var c=t==='cid';
  $id('login-cid-form').style.display=c?'':'none';
  $id('login-guest-form').style.display=c?'none':'';
  $id('ltab-cid').className='ltab'+(c?' active':'');
  $id('ltab-guest').className='ltab'+(c?'':' active');}

function doLogin(){
  var cid=p8($id('l-cid').value.trim());
  var pin=p4($id('l-pin').value.trim());
  $id('login-err').style.display='none';
  // Admin
  if(cid==='00001234'&&pin==='1234'){loginAs({cid:'00001234',cognome:'Admin',nome:'',role:'admin'});return;}
  // Visual
  if(cid==='00004321'&&pin==='4321'){loginAs({cid:'00004321',cognome:'Visual',nome:'',role:'visual'});return;}
  // Assegnatario
  var p=S.persons.find(function(x){return p8(x.CID)===cid;});
  if(!p){showLErr('CID non trovato nel sistema.');return;}
  var expPin=p.PIN?p4(p.PIN):cid.slice(-4);
  if(pin!==expPin){showLErr('PIN non corretto.');return;}
  loginAs({cid:cid,cognome:p.COGNOME,nome:p.NOME,role:'assegnatario'});}

function loginAs(user){
  S.user=user;
  S.isAdmin=user.role==='admin';
  S.isVisual=user.role==='visual';
  S.isGuest=user.role==='guest';
  startApp();}

function doGuestLogin(){
  var nome=$id('g-nome').value.trim(),cogn=$id('g-cognome').value.trim();
  var sede=$id('g-sede').value,motivo=$id('g-motivo').value;
  if(!nome||!cogn||!sede){toast('Compila tutti i campi',true);return;}
  loginAs({cid:'GUEST_'+Date.now(),cognome:cogn,nome:nome,sede:sede,motivo:motivo,role:'guest'});}

function showLErr(msg){var e=$id('login-err');e.textContent=msg;e.style.display='block';}

function doLogout(){
  S.user=null;S.isAdmin=false;S.isVisual=false;S.isGuest=false;
  clearInterval(S.arTimer);closeAll();
  $id('app').style.display='none';$id('login-page').style.display='flex';
  $id('l-cid').value='';$id('l-pin').value='';}

// START APP
function startApp(){
  $id('login-page').style.display='none';$id('app').style.display='block';
  // Logo
  var lg=$id('tb-logo');if(lg)lg.src=LOGO_SRC;
  var ll=$id('login-logo');if(ll)ll.src=LOGO_SRC;
  // User label
  var u=S.user;
  $id('tb-user').textContent=(S.isAdmin?'👑 ':S.isVisual?'👁 ':S.isGuest?'🚶 ':'👤 ')+(u.cognome+' '+u.nome).trim()+' ['+u.cid+']';
  // Tab ticket
  $id('tab-tkt-nav').style.display=(S.isAdmin||(!S.isVisual&&!S.isGuest))?'':'none';
  // Menu admin
  var ma=$id('mn-admin');if(ma)ma.style.display=S.isAdmin?'':'none';
  // Colonna azioni
  var ca=$id('col-act');if(ca)ca.style.display=(S.isVisual||S.isGuest)?'none':'';
  // Sedi guest
  popSediGuest();
  // Auto-refresh
  clearInterval(S.arTimer);
  S.arTimer=setInterval(function(){doSync(true);},REFRESH_MS);
  showLoad('Sincronizzazione dati...');
  doSync(false,function(){
    hideLoad();renderApp();
    if(!S.isAdmin&&!S.isVisual&&!S.isGuest)setFilter('assegnati');});}

function popSediGuest(){
  var sel=$id('g-sede');if(!sel)return;
  var sedi=[...new Set(S.fleet.map(function(v){return v.SEDE;}).filter(Boolean))].sort();
  sel.innerHTML='<option value="">Seleziona...</option>'+sedi.map(function(s){return '<option value="'+esc(s)+'">'+esc(s)+'</option>';}).join('');}

// RENDER
