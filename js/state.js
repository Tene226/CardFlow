/**
 * state.js
 * État global de l'application.
 * Toutes les données vivent ici — jamais dans le DOM.
 *
 * Structure :
 *   D.rows        → tous les événements normalisés
 *   D.cards       → Map ref → { last, events[] }
 *   D.dates       → liste des dates distinctes (DESC)
 *   D.lastDate    → date la plus récente
 *   D.views       → données paginées pour chaque onglet-table
 *   D.statFilter  → filtre statut actif sur la page Statuts
 */
const D = {
  rows:       [],
  cards:      new Map(),
  dates:      [],
  lastDate:   '',

  views: {
    today:   { data: [], filtered: [], page: 0, sortCol: -1, sortAsc: true },
    statuts: { data: [], filtered: [], page: 0, sortCol: -1, sortAsc: true },
    journal: { data: [], filtered: [], page: 0, sortCol: -1, sortAsc: true },
  },

  statFilter: null,
};
