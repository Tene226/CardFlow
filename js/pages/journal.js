/**
 * pages/journal.js
 * Page "Journal complet" — tous les événements, filtrables par date, action, agence, opérateur.
 */

/** Initialise les filtres et déclenche le premier rendu. */
function setupJournal() {
  fillSel('f-jn-act', uniq(D.rows.map(r => r.action)));
  fillSel('f-jn-ag',  uniq(D.rows.map(r => r.agence)).sort());
  fillSel('f-jn-uti', uniq(D.rows.map(r => r.uti).filter(Boolean)).sort());
  applyJournal();
}

/** Applique tous les filtres actifs et re-rend la table. */
function applyJournal() {
  const q   = el('f-jn-q').value.toLowerCase();
  const act = el('f-jn-act').value;
  const ag  = el('f-jn-ag').value;
  const uti = el('f-jn-uti').value;
  const d1  = (el('f-jn-d1').value || '').replace(/-/g, '/');
  const d2  = (el('f-jn-d2').value || '').replace(/-/g, '/');

  D.views.journal.filtered = D.views.journal.data.filter(r =>
    (!q   || r._search.includes(q) || r.action.toLowerCase().includes(q)) &&
    (!act || r.action  === act) &&
    (!ag  || r.agence  === ag) &&
    (!uti || r.uti     === uti) &&
    (!d1  || r.date_d  >= d1) &&
    (!d2  || r.date_d  <= d2)
  );

  D.views.journal.page = 0;
  renderPage('journal');
}

/** Génère le HTML d'une ligne du tableau Journal. */
function rowJournal(r) {
  return `<tr>
    <td class="m">${fD(r.date_d)}</td>
    <td class="m" style="color:var(--sub2)">${fH(r.heure)}</td>
    <td class="m">${r.agence}</td>
    <td class="m">${r.compte}</td>
    <td class="m">${r.ref}</td>
    <td class="m">${r.pan}</td>
    <td>${r.embossage}</td>
    <td style="color:var(--sub);font-size:11px">${r.libelle}</td>
    <td>${bdg(r.action)}</td>
    <td>${bdg(r.statut)}</td>
    <td>${r.uti ? `<span class="uti">${r.uti}</span>` : '—'}</td>
  </tr>`;
}
