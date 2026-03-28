/**
 * export.js
 * Export XLSX des vues filtrées.
 * L'export respecte les filtres actifs — seules les lignes visibles sont exportées.
 * Les colonnes de date sont exportées au format Excel date (dd/mm/yyyy).
 */

const EXPORT_CFG = {
  today: {
    headers: ['Agence','Compte','Réf.','PAN','Titulaire','Type','Action','Statut actuel','Heure','Opérateur'],
    getter:  r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.action, r.statut, fH(r.heure), r.uti],
    dateCols: [],
  },
  statuts: {
    headers: ['Agence','Compte','Réf.','PAN','Titulaire','Type','Statut','Statut prochain','Dernière action','Date','Opérateur','Expir.'],
    getter:  r => [r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.statut, r.statut_n, r.action, r.date_d, r.uti, r.expir],
    dateCols: [9, 11],
  },
  journal: {
    headers: ['Date','Heure','Agence','Compte','Réf.','PAN','Titulaire','Type','Action','Statut actuel','Opérateur'],
    getter:  r => [r.date_d, fH(r.heure), r.agence, r.compte, r.ref, r.pan, r.embossage, r.libelle, r.action, r.statut, r.uti],
    dateCols: [0],
  },
};

/**
 * Convertit une valeur (string YYYY/MM/DD ou YYYY-MM-DD, ou Date JS) en objet Date.
 * Retourne null si la valeur est vide ou invalide.
 */
function parseExcelDate(val) {
  if (!val || val === '—') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val).replace(/\//g, '-').slice(0, 10);
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Génère et télécharge un fichier XLSX pour la vue donnée.
 * @param {string} name - 'today' | 'statuts' | 'journal'
 */
function exportPage(name) {
  const cfg  = EXPORT_CFG[name];
  const view = D.views[name];
  if (!cfg || !view) return;

  const date = new Date().toISOString().slice(0, 10);

  // Construire les lignes en convertissant les colonnes date en objets Date
  const dataRows = view.filtered.map(r => {
    const row = cfg.getter(r);
    for (const col of cfg.dateCols) {
      row[col] = parseExcelDate(row[col]);
    }
    return row;
  });

  const rows = [cfg.headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(rows, { dateNF: 'DD/MM/YYYY' });

  // Appliquer le format dd/mm/yyyy sur chaque cellule de date
  if (cfg.dateCols.length && ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (const col of cfg.dateCols) {
      for (let r = 1; r <= range.e.r; r++) {
        const cellRef = XLSX.utils.encode_cell({ r, c: col });
        if (ws[cellRef] && ws[cellRef].v != null) {
          ws[cellRef].z = 'DD/MM/YYYY';
        }
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name);
  XLSX.writeFile(wb, `${name}_${date}.xlsx`);
}
