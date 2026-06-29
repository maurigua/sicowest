/* cid.js — SicOvest Next V49 */
// GESTIONE CID
function openGestioneCid(){if(!S.isAdmin)return;renderCidList('');openOv('ov-cid');}
function renderCidList(q){
  var fq=(q||($id('cid-srch')&&$id('cid-srch').value)||'').toLowerCase();
  var list=S.persons.filter(function(p){if(!fq)return true;return (p.COGNOME||'').toLowerCase().includes(fq)||(p.CID||'').includes(fq);});
  var h=list.slice(0,60).map(function(p){
    var idx=S.persons.indexOf(p);
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;" onclick="openEditCidAt('+idx+')" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'+
      '<div style="width:34px;height:34px;border-radius:50%;background:var(--navy2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">'+esc((p.COGNOME||'?')[0])+'</div>'+
      '<div style="flex:1;"><div style="font-size:12px;font-weight:600;">'+esc(p.COGNOME)+' '+esc(p.NOME)+'</div><div style="font-size:10px;color:var(--muted);font-family:monospace;">'+esc(p.CID)+'</div></div><div style="color:var(--muted2);">›</div></div>';}).join('');
  $id('cid-list').innerHTML=h||'<div class="empty"><div class="ei">👤</div><h4>Nessun risultato</h4></div>';}

function openAddCid(){S.editPIdx=-1;$id('ecid-title').textContent='👤 Nuovo CID';$id('ec-cid').value='';$id('ec-cogn').value='';$id('ec-nome').value='';$id('ec-email').value='';$id('ec-pin').value='';$id('ec-del').style.display='none';$id('ec-cid').readOnly=false;openOv('ov-ecid');}
function openEditCidAt(idx){
  var p=S.persons[idx];if(!p)return;S.editPIdx=idx;
  $id('ecid-title').textContent='✏️ Modifica CID';$id('ec-cid').value=p.CID||'';$id('ec-cogn').value=p.COGNOME||'';$id('ec-nome').value=p.NOME||'';$id('ec-email').value=p.EMAIL||'';$id('ec-pin').value=p.PIN||'';$id('ec-del').style.display='';$id('ec-cid').readOnly=true;openOv('ov-ecid');}

function saveCid(){
  var cid=p8($id('ec-cid').value.trim()),cogn=$id('ec-cogn').value.trim(),nome=$id('ec-nome').value.trim();
  var email=$id('ec-email').value.trim(),pin=$id('ec-pin').value.trim();
  if(!cid||cid==='00000000'){toast('CID obbligatorio',true);return;}
  if(!cogn){toast('Cognome obbligatorio',true);return;}
  if(S.editPIdx>=0){var p=S.persons[S.editPIdx];p.CID=cid;p.COGNOME=cogn;p.NOME=nome;p.EMAIL=email;if(pin)p.PIN=pin;}
  else{if(S.persons.find(function(x){return p8(x.CID)===cid;})){toast('CID già esistente',true);return;}S.persons.push({CID:cid,COGNOME:cogn,NOME:nome,EMAIL:email,TELEFONO:'',PIN:pin||cid.slice(-4)});}
  pushGAS('save_person',{cid:cid,cognome:cogn,nome:nome,email:email,pin:pin},null);saveLocal();closeOv('ov-ecid');renderCidList('');toast('✅ CID salvato',false,true);}

function deleteCid(){
  var idx=S.editPIdx;if(idx<0)return;var p=S.persons[idx];
  confirm2('Elimina CID '+p.CID+'?','Rimozione anagrafica.',function(){
    S.persons.splice(idx,1);pushGAS('delete_person',{cid:p.CID},null);saveLocal();closeOv('ov-ecid');renderCidList('');toast('🗑 CID eliminato',true);});}

