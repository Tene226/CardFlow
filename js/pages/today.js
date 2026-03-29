/**
 * pages/today.js
 * Page "Activité du jour" — sélecteur de date, KPIs, graphiques, tableau filtrable.
 */

/** Initialise la page : peuple le sélecteur de date et rend le premier jour. */
function renderTodayPage() {
  const sel = el('sel-date');
  sel.innerHTML = D.dates.map(d => `<option value="${d}">${fD(d)}</option>`).join('');
  renderToday();
}

/** Appelé à chaque changement de date dans le sélecteur. */
function renderToday() {
  const d    = el('sel-date').value;
  const rows = D.rows
    .filter(r => r.date_d === d)
    .sort((a, b) => a.heure.localeCompare(b.heure));

  el('today-cnt').textContent = `${rows.length} action${rows.length > 1 ? 's' : ''}`;

  D.views.today.data = rows;

  renderTodayKPIs(rows);
  renderTodayCharts(rows);
  fillSel('f-td-act', uniq(rows.map(r => r.action)));
  fillSel('f-td-ag',  uniq(rows.map(r => r.agence)).sort());
  applyToday();
}

function renderTodayKPIs(rows) {
  const kpis = [
    { v: rows.length,                                              l: 'Actions totales',    ac: '--blue',   ico: '⚡' },
    { v: new Set(rows.map(r => r.ref)).size,                       l: 'Cartes concernées',  ac: '--cyan',   ico: '💳' },
    { v: cnt(rows, 'action', 'Carte activé'),                      l: 'Activations',        ac: '--green',  ico: '✅' },
    { v: cnt(rows, 'action', 'Carte Annulée'),                     l: 'Annulations',        ac: '--red',    ico: '🚫' },
    { v: cnt(rows, 'action', 'Carte fabriqué'),                    l: 'Fabrications',       ac: '--cyan',   ico: '🔧' },
    { v: cnt(rows, 'action', 'Carte en agence'),                   l: 'En agence',          ac: '--purple', ico: '🏦' },
    { v: cnt(rows, 'action', 'Carte demandée'),                    l: 'Demandes',           ac: '--blue',   ico: '📋' },
    { v: new Set(rows.map(r => r.uti).filter(Boolean)).size,       l: 'Opérateurs actifs',  ac: '--amber',  ico: '👤' },
  ];
  el('kpi-today').innerHTML = kpis
    .map(k => `<div class="kpi" style="--ac:var(${k.ac})">
      <span class="kpi-ico">${k.ico}</span>
      <div class="kpi-v">${k.v.toLocaleString('fr')}</div>
      <div class="kpi-l">${k.l}</div>
    </div>`)
    .join('');
}

function renderTodayCharts(rows) {
  const actTop = Object.entries(byKey(rows, 'action')).sort((a, b) => b[1] - a[1]);
  mkC('ch-td-act', {
    type: 'bar',
    data: {
      labels: actTop.map(([k]) => k.length > 22 ? k.slice(0, 20) + '…' : k),
      datasets: [{
        data: actTop.map(([, v]) => v),
        backgroundColor: actTop.map(([k]) => (SC[k] || [PAL[0]])[0]),
        borderWidth: 0,
        borderRadius: 4,
      }],
    },
    options: { ...CD },
  });

  const agTop = Object.entries(byKey(rows, 'agence')).sort((a, b) => b[1] - a[1]).slice(0, 15);
  mkC('ch-td-ag', {
    type: 'bar',
    data: {
      labels: agTop.map(([k]) => k),
      datasets: [{
        data: agTop.map(([, v]) => v),
        backgroundColor: 'rgba(139,92,246,.5)',
        borderColor:     '#8b5cf6',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: { ...CD },
  });
}

/** Applique les filtres texte + action + agence et re-rend la table. */
function applyToday() {
  const q   = el('f-td-q').value.toLowerCase();
  const act = el('f-td-act').value;
  const ag  = el('f-td-ag').value;

  D.views.today.filtered = D.views.today.data.filter(r =>
    (!q   || r._search.includes(q) || r.action.toLowerCase().includes(q)) &&
    (!act || r.action  === act) &&
    (!ag  || r.agence  === ag)
  );

  D.views.today.page = 0;
  renderPage('today');
}

/** Génère le HTML d'une ligne du tableau Activité du jour. */
function rowToday(r) {
  return `<tr>
    <td class="m">${esc(r.agence)}</td>
    <td class="m">${esc(r.compte)}</td>
    <td class="m">${esc(r.ref)}</td>
    <td class="m">${esc(r.pan)}</td>
    <td>${esc(r.embossage)}</td>
    <td style="color:var(--sub);font-size:11px">${esc(r.libelle)}</td>
    <td>${bdg(r.action)}</td>
    <td>${bdg(r.statut)}</td>
    <td class="m" style="color:var(--sub2);font-size:11px">${fH(r.heure)}</td>
    <td>${r.uti ? `<span class="uti">${esc(r.uti)}</span>` : '—'}</td>
  </tr>`;
}
