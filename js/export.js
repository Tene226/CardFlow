/**
 * export.js
 * Export CSV des vues filtrées.
 * L'export respecte les filtres actifs — seules les lignes visibles sont exportées.
 */

const EXPORT_CFG = {
  today: {
    headers: ['Agence','Compte','Réf.','PAN','Titulaire','Type','Action','Statut actuel','Heure','Opérateur'],
    getter:  r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.action, r.statut, fH(r.heure), r.uti],
  },
  statuts: {
    headers: ['Agence','Compte','Réf.','PAN','Titulaire','Type','Statut','Statut prochain','Dernière action','Date','Opérateur','Expir.'],
    getter:  r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.statut, r.statut_n, r.action, fD(r.date_d), r.uti, fDate(r.expir)],
  },
  journal: {
    headers: ['Date','Heure','Agence','Compte','Réf.','PAN','Titulaire','Type','Action','Statut actuel','Opérateur'],
    getter:  r => [fD(r.date_d), fH(r.heure), r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.action, r.statut, r.uti],
  },
};

/**
 * Génère et télécharge un fichier CSV pour la vue donnée.
 * @param {string} name - 'today' | 'statuts' | 'journal'
 */
function exportPage(name) {
  const cfg  = EXPORT_CFG[name];
  const view = D.views[name];
  if (!cfg || !view) return;

  const date = new Date().toISOString().slice(0, 10);
  const rows = [cfg.headers, ...view.filtered.map(cfg.getter)];

  const csv = rows
    .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  download(`\uFEFF${csv}`, `${name}_${date}.csv`, 'text/csv;charset=utf-8;');
}

/** Déclenche un téléchargement dans le navigateur. */
function download(content, filename, mimeType) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = filename;
  a.click();
}
