/**
 * table.js
 * Moteur central de pagination et de tri.
 * Toutes les tables de l'application passent par ce module.
 *
 * Principe :
 *   - Les données filtrées vivent dans D.views[name].filtered (JS pur)
 *   - On ne rend que PAGE_SIZE lignes à la fois dans le DOM
 *   - Le tri opère sur filtered[] — jamais sur des <tr>
 */

/* ── Configuration des vues ─────────────────────────────────────────
   Associe chaque nom de vue à ses IDs DOM et sa fonction de rendu de ligne.
   Ajouter une nouvelle table = ajouter une entrée ici.
──────────────────────────────────────────────────────────────────── */
const VIEWS_CFG = {
  today:   { tbody: 'bd-td', pager: 'pg-td', rc: 'rc-td',  rowFn: r => rowToday(r)   },
  statuts: { tbody: 'bd-st', pager: 'pg-st', rc: 'rc-st',  rowFn: r => rowStatuts(r) },
  journal: { tbody: 'bd-jn', pager: 'pg-jn', rc: 'rc-jn',  rowFn: r => rowJournal(r) },
};

/* ── Getters de colonnes ─────────────────────────────────────────────
   Chaque getter retourne un tableau de valeurs dans l'ordre des colonnes
   de l'en-tête HTML correspondant. Utilisé pour le tri et l'export CSV.
──────────────────────────────────────────────────────────────────── */
const ROW_GETTERS = {
  today:   r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.action,   r.statut,   fH(r.heure), r.uti],
  statuts: r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.statut,   r.statut_n, r.action,    r.date_d, r.uti, String(r.expir)],
  journal: r => [r.date_d, r.heure,  r.agence, r.compte, r.ref, r.pan, r.embossage,   r.libelle,  r.action,    r.statut, r.uti],
};

/**
 * Rend la page courante d'une vue dans le DOM.
 * Appelé après chaque filtre, tri ou changement de page.
 */
function renderPage(name) {
  const v   = D.views[name];
  const cfg = VIEWS_CFG[name];
  const total = v.filtered.length;

  if (total === 0) {
    el(cfg.tbody).innerHTML = `
      <tr class="empty-row">
        <td colspan="20">
          <div class="empty-state-inner">
            <span class="empty-ico">🔍</span>
            <div class="empty-msg">Aucun résultat</div>
            <div class="empty-sub">Aucun enregistrement ne correspond aux filtres appliqués</div>
          </div>
        </td>
      </tr>`;
    el(cfg.rc).textContent  = '0 enr.';
    el(cfg.pager).innerHTML = '';
    return;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  v.page = Math.min(v.page, pages - 1);

  const start = v.page * PAGE_SIZE;
  const slice = v.filtered.slice(start, start + PAGE_SIZE);

  el(cfg.tbody).innerHTML = slice.map(cfg.rowFn).join('');
  el(cfg.rc).textContent  = `${total.toLocaleString('fr')} enr.`;
  renderPager(cfg.pager, v, pages, name);
}

/**
 * Génère les boutons de pagination avec fenêtre glissante de 7 pages.
 */
function renderPager(pgId, v, pages, name) {
  if (pages <= 1) { el(pgId).innerHTML = ''; return; }

  const p  = v.page;
  const lo = Math.max(0, p - 3);
  const hi = Math.min(pages - 1, p + 3);
  let btns = '';

  btns += `<button ${p === 0 ? 'disabled' : ''} onclick="changePage('${name}',${p - 1})">‹ Préc.</button>`;

  if (lo > 0) {
    btns += `<button onclick="changePage('${name}',0)">1</button>`;
    if (lo > 1) btns += '<span style="color:var(--sub);padding:0 4px">…</span>';
  }

  for (let i = lo; i <= hi; i++) {
    btns += `<button class="${i === p ? 'cur' : ''}" onclick="changePage('${name}',${i})">${i + 1}</button>`;
  }

  if (hi < pages - 1) {
    if (hi < pages - 2) btns += '<span style="color:var(--sub);padding:0 4px">…</span>';
    btns += `<button onclick="changePage('${name}',${pages - 1})">${pages}</button>`;
  }

  btns += `<button ${p === pages - 1 ? 'disabled' : ''} onclick="changePage('${name}',${p + 1})">Suiv. ›</button>`;
  btns += `<span class="pager-info">Page ${p + 1} / ${pages} · ${v.filtered.length.toLocaleString('fr')} enr.</span>`;

  el(pgId).innerHTML = btns;
}

/** Change la page courante d'une vue et re-rend. */
function changePage(name, page) {
  D.views[name].page = page;
  renderPage(name);
}

/**
 * Trie la vue en mémoire sur la colonne cliquée.
 * Double-clic sur la même colonne inverse l'ordre.
 */
function sortView(name, col) {
  const v = D.views[name];

  if (v.sortCol === col) {
    v.sortAsc = !v.sortAsc;
  } else {
    v.sortCol = col;
    v.sortAsc = true;
  }

  const asc = v.sortAsc;
  const get = ROW_GETTERS[name];

  v.filtered.sort((a, b) => {
    const av = get(a)[col] ?? '';
    const bv = get(b)[col] ?? '';
    const na = parseFloat(String(av).replace(/\s/g, ''));
    const nb = parseFloat(String(bv).replace(/\s/g, ''));
    if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
    return asc
      ? String(av).localeCompare(String(bv), 'fr')
      : String(bv).localeCompare(String(av), 'fr');
  });

  v.page = 0;
  renderPage(name);
  updateSortHeaders(name, col, asc);
}

/**
 * Met à jour les indicateurs visuels (▲ / ▼) dans les en-têtes de colonne.
 */
function updateSortHeaders(name, col, asc) {
  const tbodyId = VIEWS_CFG[name].tbody;
  const headers = el(tbodyId).closest('table').querySelectorAll('thead th');
  headers.forEach((th, i) => {
    th.classList.toggle('srt', i === col);
    th.textContent = th.textContent.replace(/ [▲▼]/, '') + (i === col ? (asc ? ' ▲' : ' ▼') : '');
  });
}
