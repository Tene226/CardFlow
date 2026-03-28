/**
 * pages/stats.js
 * Page "Statistiques" — KPIs globaux, graphiques, détection d'anomalies.
 */

function renderStats() {
  const cards    = D.views.statuts.data;
  const total    = cards.length;
  const multiEvt = [...D.cards.values()].filter(c => c.events.length > 1).length;

  renderStatsKPIs(cards, total, multiEvt);
  renderStatsCharts(cards);
  renderAnomalies();
}

function renderStatsKPIs(cards, total, multiEvt) {
  const kpis = [
    { v: D.rows.length.toLocaleString('fr'),              l: 'Total événements',         ac: '--blue',   ico: '⚡' },
    { v: total.toLocaleString('fr'),                      l: 'Cartes uniques',           ac: '--cyan',   ico: '💳' },
    { v: D.dates.length,                                  l: "Jours d'activité",         ac: '--amber',  ico: '📅' },
    { v: (D.rows.length / total).toFixed(1),              l: 'Évén. moyen / carte',      ac: '--purple', ico: '📊' },
    { v: multiEvt.toLocaleString('fr'),                   l: 'Cartes avec historique',   ac: '--indigo', ico: '🔄', d: '> 1 événement' },
    { v: cnt(cards, 'statut', 'Carte activé').toLocaleString('fr'),   l: 'Activées',     ac: '--green',  ico: '✅' },
    { v: cnt(cards, 'statut', 'Carte Annulée').toLocaleString('fr'),  l: 'Annulées',     ac: '--red',    ico: '🚫' },
    { v: cnt(cards, 'statut', 'Carte Expirée').toLocaleString('fr'),  l: 'Expirées',     ac: '--amber',  ico: '⏰' },
  ];

  el('kpi-stats').innerHTML = kpis
    .map(k => `<div class="kpi" style="--ac:var(${k.ac})">
      <span class="kpi-ico">${k.ico}</span>
      <div class="kpi-v">${k.v}</div>
      <div class="kpi-l">${k.l}</div>
      ${k.d ? `<div class="kpi-d b">${k.d}</div>` : ''}
    </div>`)
    .join('');
}

function renderStatsCharts(cards) {
  // Statuts (barres horizontales)
  const stD = Object.entries(byKey(cards, 'statut')).sort((a, b) => b[1] - a[1]);
  mkC('ch-st-dist', {
    type: 'bar',
    data: {
      labels: stD.map(([k]) => k.length > 22 ? k.slice(0, 20) + '…' : k),
      datasets: [{
        data: stD.map(([, v]) => v),
        backgroundColor: stD.map(([k]) => (SC[k] || [PAL[0]])[0]),
        borderWidth: 0,
        borderRadius: 4,
      }],
    },
    options: { ...CD, indexAxis: 'y' },
  });

  // Types de carte (doughnut)
  const tyD = Object.entries(byKey(cards, 'libelle')).sort((a, b) => b[1] - a[1]);
  mkC('ch-ty-dist', {
    type: 'doughnut',
    data: {
      labels: tyD.map(([k]) => k.trim().slice(0, 28)),
      datasets: [{
        data: tyD.map(([, v]) => v),
        backgroundColor: PAL.slice(0, tyD.length),
        borderWidth: 0,
      }],
    },
    options: {
      ...CD,
      cutout: '58%',
      plugins: {
        ...CD.plugins,
        legend: { display: true, position: 'right', labels: { color: '#475569', font: { size: 10 }, boxWidth: 10, padding: 6 } },
      },
    },
  });

  // Timeline globale (courbe)
  const dtC  = byKey(D.rows, 'date_d');
  const dtS  = [...D.dates].reverse().map(d => ({ d, v: dtC[d] || 0 }));
  mkC('ch-tl-gl', {
    type: 'line',
    data: {
      labels: dtS.map(x => x.d.replace(/\//g, '-')),
      datasets: [{
        label: 'Actions',
        data: dtS.map(x => x.v),
        borderColor:     '#f0b429',
        backgroundColor: 'rgba(240,180,41,.08)',
        borderWidth: 2,
        pointRadius: 2,
        tension: .3,
        fill: true,
      }],
    },
    options: { ...CD },
  });

  // Opérateurs (UTI_ACTION)
  const utiD = Object.entries(byKey(D.rows, 'uti'))
    .filter(([k]) => k)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  mkC('ch-uti', {
    type: 'bar',
    data: {
      labels: utiD.map(([k]) => k),
      datasets: [{
        data: utiD.map(([, v]) => v),
        backgroundColor: 'rgba(99,102,241,.55)',
        borderColor:     '#6366f1',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: { ...CD },
  });

  // Top agences par volume
  const agD = Object.entries(byKey(cards, 'agence')).sort((a, b) => b[1] - a[1]).slice(0, 15);
  mkC('ch-ag-vol', {
    type: 'bar',
    data: {
      labels: agD.map(([k]) => k),
      datasets: [{
        data: agD.map(([, v]) => v),
        backgroundColor: 'rgba(6,182,212,.5)',
        borderColor:     '#06b6d4',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: { ...CD },
  });
}

/** Détecte les cartes avec ≥ 3 rejets de fabrication (anomalie opérationnelle). */
function renderAnomalies() {
  const anomalies = [];

  for (const [ref, c] of D.cards) {
    const rejets = c.events.filter(e => e.action === 'Demande fabrication rejetée');
    if (rejets.length >= 3) {
      const dates = rejets.map(e => e.date_d).sort();
      anomalies.push({
        ref,
        nom:       c.last.embossage,
        agence:    c.last.agence,
        rejets:    rejets.length,
        dateFirst: dates[0],
        dateLast:  dates[dates.length - 1],
        statut:    c.last.statut,
      });
    }
  }

  anomalies.sort((a, b) => b.rejets - a.rejets);

  if (!anomalies.length) {
    el('anomaly-list').innerHTML = `
      <div class="empty-state-inner" style="padding:40px 0">
        <span class="empty-ico">✅</span>
        <div class="empty-msg">Aucune anomalie détectée</div>
        <div class="empty-sub">Aucune carte ne présente ≥ 3 rejets de fabrication</div>
      </div>`;
    return;
  }

  el('anomaly-list').innerHTML =
    `<div style="margin-bottom:14px;font-size:12px;color:var(--red);font-weight:600;display:flex;align-items:center;gap:6px">
      <span>⚠</span>
      <span>${anomalies.length} carte(s) présentent ≥ 3 rejets de fabrication — action recommandée : vérification physique de la carte</span>
    </div>` +
    anomalies.slice(0, 20).map(a => {
      const isCritique = a.rejets >= 5;
      return `
        <div class="anomaly-card${isCritique ? '' : ' warn'}" data-ref="${esc(a.ref)}">
          <span class="anomaly-criticality ${isCritique ? 'critique' : 'attention'}">
            ${isCritique ? 'Critique' : 'Attention'}
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--m);font-size:12.5px;color:var(--navy,#0F172A);font-weight:600">${esc(a.ref)}</div>
            <div style="font-size:11.5px;color:var(--sub);margin-top:2px">${esc(a.nom)} · Agence ${esc(a.agence)}</div>
            <div style="font-size:11px;color:var(--sub2);margin-top:3px">
              Premier rejet : <b>${fD(a.dateFirst)}</b> &nbsp;·&nbsp; Dernier : <b>${fD(a.dateLast)}</b>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:var(--m);font-size:18px;font-weight:700;color:${isCritique ? 'var(--red)' : 'var(--amber)'};line-height:1">${a.rejets}×</div>
            <div style="font-size:10px;color:var(--sub2);margin-top:2px">rejet(s)</div>
          </div>
          <div style="flex-shrink:0">${bdg(a.statut)}</div>
        </div>`;
    }).join('');

  el('anomaly-list').querySelectorAll('.anomaly-card[data-ref]').forEach(div => {
    div.addEventListener('click', () => goTlSearch(div.dataset.ref));
  });
}

/** Navigue vers l'onglet Historique et lance la recherche pour cette carte. */
function goTlSearch(ref) {
  goPage('p-tl', document.querySelectorAll('.ptab')[3]);
  el('tl-q').value = ref;
  searchCard();
}
