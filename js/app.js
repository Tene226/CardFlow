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
 * Utilise des icônes SVG au lieu d'emojis pour un rendu professionnel.
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
    {
      svg:   '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
      v:     D.cards.size.toLocaleString('fr'),
      l:     'Cartes analysées',
      color: '#1D4ED8',
      bg:    'rgba(29,78,216,.1)',
    },
    {
      svg:   '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      v:     actToday.toLocaleString('fr'),
      l:     'Actions du jour',
      color: '#0EA5E9',
      bg:    'rgba(14,165,233,.1)',
    },
    {
      svg:   '<polyline points="20 6 9 17 4 12"/>',
      v:     actives.toLocaleString('fr'),
      l:     'Cartes actives',
      color: '#16A34A',
      bg:    'rgba(22,163,74,.1)',
    },
    {
      svg:   '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      v:     opposees.toLocaleString('fr'),
      l:     'Cartes opposées',
      color: '#D97706',
      bg:    'rgba(217,119,6,.1)',
    },
    {
      svg:   '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      v:     agences.toLocaleString('fr'),
      l:     'Agences concernées',
      color: '#7C3AED',
      bg:    'rgba(124,58,237,.1)',
    },
    {
      svg:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      v:     anomalies.toLocaleString('fr'),
      l:     'Anomalies détectées',
      color: '#DC2626',
      bg:    'rgba(220,38,38,.1)',
    },
  ];

  el('banner').innerHTML = `<div class="kpi-global-strip">${
    kpis.map(k => `
      <div class="kpi-global">
        <div class="kpi-global-ico" style="background:${k.bg}">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:${k.color};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${k.svg}</svg>
        </div>
        <div class="kpi-global-body">
          <div class="kpi-global-v" style="color:${k.color}">${k.v}</div>
          <div class="kpi-global-l">${k.l}</div>
        </div>
      </div>`).join('')
  }</div>`;

  // Rendre le dashboard overview
  renderOverview();
}

/**
 * Rend le dashboard de la page Vue d'ensemble.
 * Appelé après chargement des données.
 */
function renderOverview() {
  const dashEl = el('overview-dashboard');
  if (!dashEl) return;

  const cards     = D.views.statuts.data;
  const actToday  = D.rows.filter(r => r.date_d === D.lastDate).length;
  const actives   = cnt(cards, 'statut', 'Carte activé');
  const opposees  = cnt(cards, 'statut', 'Carte Opposée');
  const agences   = new Set(cards.map(c => c.agence)).size;
  const anomalies = [...D.cards.values()]
    .filter(c => c.events.filter(e => e.action === 'Demande fabrication rejetée').length >= 3);
  const nonRens   = cnt(cards, 'statut', '(Non renseigné)');
  const dateStr   = D.lastDate ? fD(D.lastDate) : '—';

  // ── KPI data ──
  const kpiData = [
    { svg: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',           v: cards.length.toLocaleString('fr'),    l: 'Cartes analysées',   color: '#1D4ED8', bg: 'rgba(29,78,216,.1)' },
    { svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',                                           v: actToday.toLocaleString('fr'),        l: 'Actions du jour',    color: '#0EA5E9', bg: 'rgba(14,165,233,.1)' },
    { svg: '<polyline points="20 6 9 17 4 12"/>',                                                                   v: actives.toLocaleString('fr'),         l: 'Cartes actives',     color: '#16A34A', bg: 'rgba(22,163,74,.1)' },
    { svg: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', v: opposees.toLocaleString('fr'), l: 'Cartes opposées', color: '#D97706', bg: 'rgba(217,119,6,.1)' },
    { svg: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', v: agences.toLocaleString('fr'),         l: 'Agences concernées', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
    { svg: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', v: anomalies.length.toLocaleString('fr'), l: 'Anomalies détectées', color: '#DC2626', bg: 'rgba(220,38,38,.1)' },
  ];

  // ── Accès rapides ──
  const quickCards = [
    { label: 'Activité du jour',  sub: actToday + ' actions',                    page: 'p-today',   color: '#0EA5E9', bg: 'rgba(14,165,233,.1)',  svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
    { label: 'Statuts actuels',   sub: cards.length + ' cartes',                  page: 'p-statuts', color: '#7C3AED', bg: 'rgba(124,58,237,.1)', svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
    { label: 'Journal complet',   sub: D.rows.length.toLocaleString('fr') + ' événements', page: 'p-journal', color: '#1D4ED8', bg: 'rgba(29,78,216,.1)',  svg: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' },
    { label: 'Historique carte',  sub: 'Recherche individuelle',                  page: 'p-tl',      color: '#16A34A', bg: 'rgba(22,163,74,.1)',   svg: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>' },
    { label: 'Statistiques',      sub: anomalies.length + ' anomalie(s)',          page: 'p-stats',   color: '#DC2626', bg: 'rgba(220,38,38,.1)',   svg: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  ];

  // ── Alertes ──
  let alertsHTML = '';
  if (anomalies.length) {
    const critiques = anomalies.filter(c => c.events.filter(e => e.action === 'Demande fabrication rejetée').length >= 5).length;
    const badge = critiques ? critiques + '&nbsp;critique(s)' : anomalies.length + '&nbsp;anomalie(s)';
    alertsHTML += `
      <div class="overview-alert-item" onclick="sideNav('p-stats')" title="Voir les statistiques">
        <div class="overview-alert-dot"></div>
        <div class="overview-alert-text"><strong>${anomalies.length} carte(s)</strong> avec rejets de fabrication répétés — vérification requise</div>
        <span class="overview-alert-badge">${badge}</span>
      </div>`;
  }
  if (nonRens > 0) {
    alertsHTML += `
      <div class="overview-alert-item warn" onclick="sideNav('p-statuts')" title="Voir les statuts">
        <div class="overview-alert-dot"></div>
        <div class="overview-alert-text"><strong>${nonRens} carte(s)</strong> avec statut "(Non renseigné)" à qualifier</div>
        <span class="overview-alert-badge" style="background:var(--amber-d);color:var(--amber);border-color:rgba(180,83,9,.2)">${nonRens}</span>
      </div>`;
  }
  if (opposees > 0) {
    alertsHTML += `
      <div class="overview-alert-item warn" onclick="sideNav('p-statuts')" title="Voir les statuts">
        <div class="overview-alert-dot"></div>
        <div class="overview-alert-text"><strong>${opposees} carte(s)</strong> en opposition — suivi recommandé</div>
        <span class="overview-alert-badge" style="background:var(--amber-d);color:var(--amber);border-color:rgba(180,83,9,.2)">${opposees}</span>
      </div>`;
  }
  if (!alertsHTML) {
    alertsHTML = `
      <div class="overview-no-alert">
        <div class="overview-no-alert-ico">
          <svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--green);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.6"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="overview-no-alert-msg">Aucune alerte prioritaire</div>
        <div class="overview-no-alert-sub">Le portefeuille ne présente pas d'anomalie critique</div>
      </div>`;
  }

  dashEl.innerHTML = `
    <div class="overview-hero">
      <div class="overview-hero-left">
        <div class="overview-hero-eyebrow">Pilotage Cartes VISA — Dernière activité&nbsp;: ${esc(dateStr)}</div>
        <div class="overview-hero-title">${cards.length.toLocaleString('fr')} cartes analysées</div>
        <div class="overview-hero-sub">
          ${D.rows.length.toLocaleString('fr')} événements &nbsp;·&nbsp;
          ${agences} agence(s) &nbsp;·&nbsp;
          ${D.dates.length} jour(s) d'activité
        </div>
      </div>
      <div class="overview-hero-actions">
        <button class="overview-hero-btn" onclick="exportPDF('overview')">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Exporter PDF
        </button>
        <button class="overview-hero-btn ghost" onclick="document.getElementById('file-in').click()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Nouveau fichier
        </button>
      </div>
    </div>

    <div class="kpi-global-strip" style="margin-bottom:24px">
      ${kpiData.map(k => `
        <div class="kpi-global">
          <div class="kpi-global-ico" style="background:${k.bg}">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:${k.color};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${k.svg}</svg>
          </div>
          <div class="kpi-global-body">
            <div class="kpi-global-v" style="color:${k.color}">${k.v}</div>
            <div class="kpi-global-l">${k.l}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="g2" style="margin-bottom:0;align-items:start">
      <div>
        <div class="overview-section-title">Alertes prioritaires</div>
        <div class="overview-alerts-list">${alertsHTML}</div>
      </div>
      <div>
        <div class="overview-section-title">Accès rapides</div>
        <div class="quick-access-grid">
          ${quickCards.map(c => `
            <button class="quick-access-card" onclick="sideNav('${c.page}')">
              <div class="quick-access-card-ico" style="background:${c.bg}">
                <svg viewBox="0 0 24 24" style="stroke:${c.color}">${c.svg}</svg>
              </div>
              <div>
                <div class="quick-access-card-label">${c.label}</div>
                <div class="quick-access-card-sub">${c.sub}</div>
              </div>
            </button>`).join('')}
        </div>
      </div>
    </div>
  `;
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
