/**
 * app.js
 * Orchestration générale : navigation entre pages, KPI global, fonctions reset.
 */

function goPage(pageId, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  el(pageId).classList.add('active');
  if (tabEl) tabEl.classList.add('active');
}

/**
 * Rend le bandeau KPI global après chargement.
 */
function renderBanner(_filename) {
  const cards    = D.views.statuts.data;
  const actToday = D.rows.filter(r => r.date_d === D.lastDate).length;
  const actives  = cnt(cards, 'statut', 'Carte activé');
  const opposees = cnt(cards, 'statut', 'Carte Opposée');
  const agences  = new Set(cards.map(c => c.agence)).size;
  const anomalies = [...D.cards.values()]
    .filter(c => c.events.filter(e => e.action === 'Demande fabrication rejetée').length >= 3)
    .length;

  const kpis = [
    { ico: '💳', v: D.cards.size.toLocaleString('fr'),  l: 'Cartes analysées',   color: '#1D4ED8', bg: 'rgba(29,78,216,.1)'  },
    { ico: '⚡', v: actToday.toLocaleString('fr'),       l: 'Actions du jour',    color: '#0EA5E9', bg: 'rgba(14,165,233,.1)' },
    { ico: '✅', v: actives.toLocaleString('fr'),         l: 'Cartes actives',     color: '#16A34A', bg: 'rgba(22,163,74,.1)'  },
    { ico: '⚠️', v: opposees.toLocaleString('fr'),        l: 'Cartes opposées',    color: '#D97706', bg: 'rgba(217,119,6,.1)'  },
    { ico: '🏢', v: agences.toLocaleString('fr'),         l: 'Agences concernées', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
    { ico: '🔴', v: anomalies.toLocaleString('fr'),       l: 'Anomalies détectées',color: '#DC2626', bg: 'rgba(220,38,38,.1)'  },
  ];

  el('banner').innerHTML = `<div class="kpi-global-strip">${
    kpis.map(k => `
      <div class="kpi-global">
        <div class="kpi-global-ico" style="background:${k.bg}">
          <span style="font-size:18px">${k.ico}</span>
        </div>
        <div class="kpi-global-body">
          <div class="kpi-global-v" style="color:${k.color}">${k.v}</div>
          <div class="kpi-global-l">${k.l}</div>
        </div>
      </div>`).join('')
  }</div>`;
}

/* ── Fonctions reset filtres ─────────────────────────── */
function resetToday() {
  el('f-td-q').value = '';
  el('f-td-act').selectedIndex = 0;
  el('f-td-ag').selectedIndex  = 0;
  applyToday();
}

function resetStatuts() {
  el('f-st-q').value = '';
  el('f-st-ag').selectedIndex  = 0;
  el('f-st-lib').selectedIndex = 0;
  // Réinitialiser le filtre statut actif
  D.statFilter = null;
  document.querySelectorAll('.statut-card.af').forEach(c => c.classList.remove('af'));
  applyStatuts();
}

function resetJournal() {
  el('f-jn-q').value   = '';
  el('f-jn-act').selectedIndex = 0;
  el('f-jn-ag').selectedIndex  = 0;
  el('f-jn-uti').selectedIndex = 0;
  el('f-jn-d1').value  = '';
  el('f-jn-d2').value  = '';
  applyJournal();
}
