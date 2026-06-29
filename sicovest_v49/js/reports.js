/* reports.js — SicOvest Next V49 */
// REPORTS
function renderReports(){
  var el=$id('tab-reports');if(!el)return;
  var reps=[{icon:'🏙',t:'ZTL in scadenza (30gg)',d:'Permessi ZTL prossimi alla scadenza',fn:'expZtl'},
    {icon:'🔧',t:'Veicoli in officina',d:'Elenco veicoli in riparazione',fn:'expOff'},
    {icon:'🎫',t:'Ticket aperti',d:'Segnalazioni non ancora chiuse',fn:'expTkt'},
    {icon:'🅿️',t:'EasyPark attivi',d:'Veicoli con dispositivo EasyPark',fn:'expEP'},
    {icon:'🔄',t:'Scorte libere',d:'Auto sostitutive disponibili',fn:'expScorte'},
    {icon:'📋',t:'Flotta completa',d:'Export CSV di tutti i veicoli',fn:'expFlotta'},
    {icon:'👤',t:'Anagrafiche CID',d:'Elenco persone e assegnazioni',fn:'expPersone'},
    {icon:'🗑',t:'Targhe cancellate',d:'Storico veicoli rimossi',fn:'expCanc'}];
  el.innerHTML='<div class="sec-t">📋 Report disponibili</div>'+
    '<div class="ss">'+reps.map(function(r){return '<div class="sr" onclick="'+r.fn+'()"><div class="sri" style="background:#eff6ff;font-size:16px;">'+r.icon+'</div><div><div class="srt">'+r.t+'</div><div class="srs">'+r.d+'</div></div><div class="sra">⬇️</div></div>';}).join('')+'</div>'+
    '<div class="sec-t" style="margin-top:10px;">🔗 Link utili</div>'+
    '<div class="ss"><div class="sr" onclick="openGDrive()"><div class="sri" style="background:#d1fae5;">📂</div><div><div class="srt">Documenti Google Drive</div><div class="srs">PDF assicurazioni, carte circolazione, tagliandi ZTL</div></div><div class="sra">↗️</div></div></div>';}

function csvDL(fname,rows,cols){
  var csv=[cols.join(';')].concat(rows.map(function(r){return cols.map(function(c){return '"'+(r[c]||'').replace(/"/g,'""')+'"';}).join(';');})).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));a.download=fname;a.click();toast('📥 '+fname,false,true);}

function expZtl(){var r=[];S.fleet.forEach(function(v){getZTL(v.TARGA).filter(function(z){return ztlExpiring(z.scadenza);}).forEach(function(z){var a=getAss(v.TARGA);r.push({TARGA:v.TARGA,MODELLO:v.TIPO_VEICOLO||'',SEDE:v.SEDE||'',ASSEGNATARIO:a?(a.cognome+' '+a.nome):'',CITTA:z.citta,SCADENZA:z.scadenza});});});csvDL('ZTL_scadenza_'+today().replace(/\//g,'-')+'.csv',r,['TARGA','MODELLO','SEDE','ASSEGNATARIO','CITTA','SCADENZA']);}
function expOff(){var r=S.fleet.filter(function(v){return (S.runtime[v.TARGA]||{}).stato==='Officina';}).map(function(v){var a=getAss(v.TARGA),rt=S.runtime[v.TARGA]||{};return {TARGA:v.TARGA,MODELLO:v.TIPO_VEICOLO||'',SEDE:v.SEDE||'',ASSEGNATARIO:a?(a.cognome+' '+a.nome):'',OFFICINA:rt.officina||''};});csvDL('Officina_'+today().replace(/\//g,'-')+'.csv',r,['TARGA','MODELLO','SEDE','ASSEGNATARIO','OFFICINA']);}
function expTkt(){var r=S.tickets.filter(function(t){return t.stato==='APERTO';}).map(function(t){return {ID:t.id,TARGA:t.targa,TIPO:t.tipo,CID:t.cid,ASSEGNATARIO:t.cognome+' '+t.nome,BLOCCANTE:t.bloccante?'SI':'NO',DESCRIZIONE:t.testo||'',DATA:t.data||''};});csvDL('Ticket_'+today().replace(/\//g,'-')+'.csv',r,['ID','TARGA','TIPO','CID','ASSEGNATARIO','BLOCCANTE','DESCRIZIONE','DATA']);}
function expEP(){var r=S.ep.filter(function(e){return (e.ATTIVO||'').toUpperCase()==='SI';}).map(function(e){var v=S.fleet.find(function(x){return x.TARGA===e.TARGA;}),a=getAss(e.TARGA);return {TARGA:e.TARGA,MODELLO:v?v.TIPO_VEICOLO||'':'',SEDE:v?v.SEDE||'':'',ASSEGNATARIO:a?(a.cognome+' '+a.nome):''}; });csvDL('EasyPark_'+today().replace(/\//g,'-')+'.csv',r,['TARGA','MODELLO','SEDE','ASSEGNATARIO']);}
function expScorte(){var r=S.fleet.filter(function(v){var ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};return ut==='SCORTA'&&!rt.assegnato_a&&rt.stato!=='Officina';}).map(function(v){return {TARGA:v.TARGA,MODELLO:v.TIPO_VEICOLO||'',SEDE:v.SEDE||''};});csvDL('ScorteLibere_'+today().replace(/\//g,'-')+'.csv',r,['TARGA','MODELLO','SEDE']);}
function expFlotta(){var r=S.fleet.map(function(v){var a=getAss(v.TARGA),ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};return {TARGA:v.TARGA,MODELLO:v.TIPO_VEICOLO||'',SEDE:v.SEDE||'',CID:a?a.cid:'',ASSEGNATARIO:a?(a.cognome+' '+a.nome):'',TIPO:ut||'ASSEGNATA',STATO:rt.stato||'Marciante',PIN_ENI:v.PIN_ENILIVE||'',PIN_Q8:v.PIN_Q8||'',EP:hasEP(v.TARGA)?'SI':'NO'};});csvDL('Flotta_'+today().replace(/\//g,'-')+'.csv',r,['TARGA','MODELLO','SEDE','CID','ASSEGNATARIO','TIPO','STATO','PIN_ENI','PIN_Q8','EP']);}
function expPersone(){csvDL('Anagrafiche_'+today().replace(/\//g,'-')+'.csv',S.persons,['CID','COGNOME','NOME','EMAIL','TELEFONO']);}
function expCanc(){csvDL('Cancellate_'+today().replace(/\//g,'-')+'.csv',S.cancelled,['TARGA','TIPO_VEICOLO','SEDE','DATA_CANCELLAZIONE','CID_AUTORE']);}

