/**
 * pages/statuts.js
 * Page "Statuts actuels" — grille cliquable par statut + tableau filtrable.
 * Une ligne par carte (dernier état connu = D.cards.last).
 */

/** Initialise la page statuts. */
function renderStatutsPage() {
  const cards = D.views.statuts.data;
  const total = cards.length;

  // Exclure "(Non renseigné)" de la grille — afficher en alerte séparée
  const nonRens   = cards.filter(r => r.statut === '(Non renseigné)');
  const knownCards = cards.filter(r => r.statut !== '(Non renseigné)');
  const statDist  = Object.entries(byKey(knownCards, 'statut')).sort((a, b) => b[1] - a[1]);

  // Alerte pour les cartes sans statut renseigné
  const alertHtml = nonRens.length
    ? `<div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);
          border-radius:9px;padding:10px 16px;margin-bottom:14px;font-size:12px;color:var(--amber)">
        ⚠ <b>${nonRens.length}</b> carte(s) sans statut renseigné dans le fichier source
        <span style="margin-left:12px;color:var(--sub2);font-family:var(--m)">
          Réf. : ${[...new Set(nonRens.map(r => r.ref))].join(', ')}
        </span>
      </div>`
    : '';

  el('statut-grid').innerHTML = alertHtml + statDist.map(([s, n]) => {
    const [fg] = SC[s] || ['#4e6a8c'];
    const safeName = s.replace(/'/g, "\\'");
    return `<div class="statut-card" style="--ac:${fg}"
                 onclick="toggleStatutFilter('${safeName}', this)">
      <div class="statut-card-v" style="color:${fg}">${n.toLocaleString('fr')}</div>
      <div class="statut-card-l">${s}</div>
      <div class="statut-card-p">${((n / total) * 100).toFixed(1)} %</div>
    </div>`;
  }).join('');

  fillSel('f-st-ag',  uniq(cards.map(r => r.agence)).sort());
  fillSel('f-st-lib', uniq(cards.map(r => r.libelle)).sort());
  applyStatuts();
}

/** Bascule le filtre statut (clic sur une carte de la grille). */
function toggleStatutFilter(s, cardEl) {
  document.querySelectorAll('.statut-card').forEach(c => c.classList.remove('af'));
  if (D.statFilter === s) {
    D.statFilter = null;
  } else {
    D.statFilter = s;
    cardEl.classList.add('af');
  }
  applyStatuts();
}

/** Applique les filtres et re-rend la table. */
function applyStatuts() {
  const q   = el('f-st-q').value.toLowerCase();
  const ag  = el('f-st-ag').value;
  const lib = el('f-st-lib').value;

  D.views.statuts.filtered = D.views.statuts.data.filter(r =>
    (!q          || r._search.includes(q)) &&
    (!ag         || r.agence  === ag) &&
    (!lib        || r.libelle === lib) &&
    (!D.statFilter || r.statut === D.statFilter)
  );

  D.views.statuts.page = 0;
  renderPage('statuts');
}

/** Génère le HTML d'une ligne du tableau Statuts actuels. */
function rowStatuts(r) {
  return `<tr>
    <td class="m">${r.agence}</td>
    <td class="m">${r.compte}</td>
    <td class="m">${r.ref}</td>
    <td class="m">${r.pan}</td>
    <td>${r.embossage}</td>
    <td style="color:var(--sub);font-size:11px">${r.libelle}</td>
    <td>${bdg(r.statut)}</td>
    <td>${r.statut_n ? bdg(r.statut_n) : '—'}</td>
    <td>${r.action  ? bdg(r.action)   : '—'}</td>
    <td class="m" style="font-size:11px;color:var(--sub2)">${fD(r.date_d)}</td>
    <td>${r.uti ? `<span class="uti">${r.uti}</span>` : '—'}</td>
    <td class="m" style="font-size:11px;color:var(--sub2)">${fDate(r.expir)}</td>
  </tr>`;
}
