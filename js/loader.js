/**
 * loader.js
 * Chargement du fichier XLSX et normalisation des données brutes.
 * Point d'entrée : loadFile(inputElement)
 */

/**
 * Déclenché par onchange sur l'input file.
 * Lit le XLSX, normalise chaque ligne, construit l'état global.
 */
function loadFile(inp) {
  const file = inp.files[0];
  if (!file) return;

  el('ld').style.display = 'block';

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb  = XLSX.read(e.target.result, { type: 'array', cellDates: true });
      const sn  = wb.SheetNames.find(s => /export/i.test(s)) || wb.SheetNames[0];
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[sn], { defval: null });

      if (!raw.length) throw new Error('Le fichier est vide ou ne contient aucune ligne de données.');

      // Peuplement de l'état global
      D.rows = raw.map(normaliseRow);
      buildCardMap();
      buildDateList();

      // Préparation des vues paginées
      D.views.journal.data = [...D.rows].sort((a, b) => b.date_act.localeCompare(a.date_act));
      D.views.statuts.data = [...D.cards.values()].map(c => c.last);

      // Rendu initial
      renderBanner(file.name);
      renderStats();
      renderTodayPage();
      renderStatutsPage();
      setupJournal();

      // UI
      el('ld').style.display = 'none';
      el('upload-zone').classList.add('loaded');
      el('upload-fname').textContent = file.name;
      el('views').classList.add('show');
      el('nav-pill').classList.add('ok');
      el('nav-txt').textContent = `${file.name} · ${D.rows.length.toLocaleString('fr')} événements`;
    } catch (err) {
      el('ld').style.display = 'none';
      el('upload-fname').textContent = '⚠ Erreur : ' + err.message;
      console.error('[CardFlow] Erreur de chargement :', err);
    }
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Normalise une ligne brute XLSX en objet structuré.
 * Gère les variations de noms de colonnes entre les versions d'extraction.
 */
function normaliseRow(r) {
  const t  = v => (typeof v === 'string' ? v.trim() : (v ?? ''));
  const da = t(r['DATE_ACTION']);
  const dp = da.slice(0, 10);      // YYYY/MM/DD
  const hr = da.slice(10).trim();  // heure brute (HHMMSS ou HH:MM:SS)

  return {
    agence:   String(r['AGENCE']  ?? ''),
    compte:   String(r['COMPTE']  ?? ''),
    libelle:  t(r['LIBELLE']),
    ref:      String(r['REF. CARTE'] ?? r['REF.CARTE'] ?? ''),
    pan:      t(r['PAN MASQUE']),
    expir:    r['DATE EXPIR'] ?? '',
    embossage:t(r['EMBOSSAGE']),
    action:   t(r['ACTION']),
    date_act: da,
    date_d:   dp,
    heure:    hr,
    uti:      t(r['UTI_ACTION']),
    statut:   t(r['STATUT ACTUELLE']) || '(Non renseigné)',
    statut_n: t(r['STATUT PROCHAINE CARTE']),
    // Champ de recherche pré-calculé (concaténation en minuscules)
    // Calculé une seule fois au chargement pour optimiser les filtres
    _search: [
      r['AGENCE'], r['COMPTE'], r['REF. CARTE'] ?? r['REF.CARTE'],
      r['PAN MASQUE'], r['EMBOSSAGE'], r['LIBELLE'], r['UTI_ACTION'],
    ].map(v => String(v ?? '').toLowerCase()).join(' '),
  };
}

/**
 * Construit la Map des cartes : ref → { last, events[] }
 * last = événement le plus récent (dernier statut connu)
 */
function buildCardMap() {
  D.cards.clear();
  for (const r of D.rows) {
    if (!D.cards.has(r.ref)) D.cards.set(r.ref, { last: r, events: [] });
    D.cards.get(r.ref).events.push(r);
  }
  for (const [, c] of D.cards) {
    c.events.sort((a, b) => a.date_act.localeCompare(b.date_act));
    c.last = c.events[c.events.length - 1];
  }
}

/**
 * Construit la liste des dates distinctes triées du plus récent au plus ancien.
 */
function buildDateList() {
  D.dates    = [...new Set(D.rows.map(r => r.date_d))].filter(Boolean).sort().reverse();
  D.lastDate = D.dates[0] || '';
}
