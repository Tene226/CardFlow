/**
 * config.js
 * Constantes globales : couleurs, palette, options Chart.js, taille de page.
 * Aucune logique métier ici.
 */

const PAGE_SIZE = 100;

/* Couleurs par statut : [couleur texte/badge, couleur fond/badge] */
const SC = {
  'Carte activé':                           ['#10b981', 'rgba(16,185,129,.15)'],
  'Carte Annulée':                          ['#f43f5e', 'rgba(244,63,94,.15)'],
  'Carte Expirée':                          ['#f59e0b', 'rgba(245,158,11,.15)'],
  'Carte fabriqué':                         ['#06b6d4', 'rgba(6,182,212,.15)'],
  'Carte en agence':                        ['#8b5cf6', 'rgba(139,92,246,.15)'],
  'Carte demandée':                         ['#3b82f6', 'rgba(59,130,246,.15)'],
  'Carte Opposée':                          ['#f0b429', 'rgba(240,180,41,.15)'],
  'Carte validé':                           ['#84cc16', 'rgba(132,204,22,.15)'],
  'Carte pré-validé':                       ['#10b981', 'rgba(16,185,129,.1)'],
  'Carte demandée au prestataire monétique':['#6366f1', 'rgba(99,102,241,.15)'],
  'Demande fabrication rejetée':            ['#ec4899', 'rgba(236,72,153,.15)'],
  'Demande carte rejetée':                  ['#dc2626', 'rgba(220,38,38,.15)'],
  'Demande fabrication validée':            ['#0ea5e9', 'rgba(14,165,233,.15)'],
  'Remis au client':                        ['#14b8a6', 'rgba(20,184,166,.15)'],
  '(Non renseigné)':                        ['#4e6a8c', 'rgba(78,106,140,.12)'],
};

/* Palette générique pour les graphiques (doughnut, barres multi-séries…) */
const PAL = [
  '#3b82f6','#06b6d4','#f59e0b','#8b5cf6','#10b981',
  '#f0b429','#ec4899','#6366f1','#84cc16','#f43f5e',
  '#14b8a6','#0ea5e9','#dc2626','#9ca3af','#a78bfa',
];

/* Options Chart.js réutilisées dans tous les graphiques */
const CD = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor:     'rgba(0,0,0,.12)',
      borderWidth:     1,
      titleColor:      '#F8FAFC',
      bodyColor:       '#94A3B8',
      titleFont: { family: 'Inter', size: 11 },
      bodyFont:  { family: 'Inter', size: 11 },
      padding: 10,
    },
  },
  scales: {
    x: {
      ticks: { color: '#475569', font: { size: 10 } },
      grid:  { color: 'rgba(0,0,0,.05)' },
      border:{ color: '#E2E8F0' },
    },
    y: {
      ticks: { color: '#475569', font: { size: 10 } },
      grid:  { color: 'rgba(0,0,0,.05)' },
      border:{ color: '#E2E8F0' },
    },
  },
};

/* Registre des instances Chart.js actives (pour destroy avant re-render) */
const CHS = {};
