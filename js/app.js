/* app.js — SicOvest Next V49 */
function renderApp(){updateKpi();updateTktBadge();var a=document.querySelector('.ntab.active');switchTab(a?a.dataset.tab:'flotta',true);}

function updateKpi(){
  var fl=S.fleet,van=0,car=0,truck=0,sc=0,tec=0,off=0;
  fl.forEach(function(v){
    var t=(v.TIPO_VEICOLO||'').toLowerCase(),ut=getUT(v.TARGA),rt=S.runtime[v.TARGA]||{};
    if(rt.stato==='Officina'){off++;return;}
    if(ut==='SCORTA'){sc++;return;}if(ut==='TECNICO'){tec++;return;}
    if(t.includes('ducato')||t.includes('daily')||t.includes('iveco'))truck++;
    else if(t.includes('panda')||t.includes('caddy')||t.includes('giulia')||t.includes('stelvio'))car++;
    else van++;});
  ['van',van,'car',car,'truck',truck,'scorta',sc,'tec',tec,'off',off,'tot',fl.length].forEach(function(_,i,a){if(i%2===0){var el=$id('kpi-'+a[i]);if(el)el.textContent=a[i+1];}});}

function updateTktBadge(){var b=$id('tkt-badge');if(b)b.textContent=S.tickets.filter(function(t){return t.stato==='APERTO';}).length;}

function switchTab(name,noRender){
  document.querySelectorAll('.ntab').forEach(function(t){t.className='ntab'+(t.dataset.tab===name?' active':'');});
  document.querySelectorAll('.tab-content').forEach(function(c){c.className=c.className.replace(' ro','')+ (c.id!=='tab-'+name?' ro':'');});
  var showFilters=name==='flotta';
  $id('filtribar').style.display=showFilters?'flex':'none';
  $id('searchwrap').style.display=showFilters?'flex':'none';
  if(!noRender)({flotta:renderFlotta,mappa:renderMappa,dashboard:renderDashboard,manut:renderManut,reports:renderReports,impost:renderImpost,ticket:renderTicket}[name]||function(){})();
  else if(name==='flotta')renderFlotta();else if(name==='dashboard')renderDashboard();}

