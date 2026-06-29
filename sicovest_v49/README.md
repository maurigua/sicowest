# SicOvest Next V49 — Struttura moduli

## Deployment
- **Android Chrome (file://)**: usa `SicOvest_Next_V49.html` (file singolo, tutto inline)
- **Web server / localhost**: usa la cartella `sicovest_v49/` con `index.html`

## File per intervento chirurgico

| File | Cosa toccare |
|------|-------------|
| `css/base.css` | Colori, variabili CSS, topbar, KPI, navtabs, login |
| `css/components.css` | Tabella veicoli, badge tipo, PIN box, paginazione |
| `css/overlays.css` | Modal overlay, form, bottoni, toast, responsive |
| `js/config.js` | GAS_URL, LKEY, PAGE_SZ, REFRESH_MS |
| `js/assets.js` | Foto veicoli e logo (base64) — NON toccare |
| `js/db.js` | Database embedded fallback — aggiorna solo se cambia il DB |
| `js/state.js` | Oggetto S (stato globale) + utility (p8, esc, $id, toast...) |
| `js/sync.js` | loadData, saveLocal, doSync, pushGAS |
| `js/auth.js` | Login CID/PIN, Guest form, logout, startApp |
| `js/app.js` | renderApp, switchTab, updateKpi, updateTktBadge |
| `js/fleet.js` | filterFleet, renderFlotta, sort, paginazione, filtri |
| `js/vehicle.js` | Dettaglio veicolo, modifica (Admin), delete |
| `js/cid.js` | Gestione anagrafiche CID (add/edit/delete) |
| `js/report.js` | Segnalazioni, ticket, rilascia scorta |
| `js/dashboard.js` | Dashboard donut, mappa Sicilia, manutenzioni |
| `js/reports.js` | Export CSV (ZTL, officina, ticket, flotta...) |
| `js/settings.js` | Impostazioni, swap rapido, documenti, log, QR |

## Ruoli
- **Admin**: CID `1234` / PIN `1234`
- **Visual**: CID `4321` / PIN `4321` (read-only)
- **Assegnatario**: CID dal DB / PIN = ultime 4 cifre CID
- **Guest**: registrazione al volo → accesso pool scorte

## GAS
- **Sheet ID**: `1csURAFeKlDkhRb-BExFC_WK3b-OIXgTFHgKcbrU2gpQ`
- **URL**: vedi `js/config.js`

## Note architettura
- Ordine script obbligatorio: config → assets → db → state → sync → auth → app → ...
- `S` (stato globale) definito in `state.js`, accessibile da tutti i moduli
- Se sync GAS fallisce → fallback automatico su `db.js` (embedded)
- Storage key: `sicovest_v49b` (cambia per invalidare cache)
