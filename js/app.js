/**
 * app.js
 * Orchestration générale : navigation entre pages, bandeau récapitulatif.
 * Chargé en dernier — tous les autres modules sont déjà disponibles.
 */

/**
 * Navigue vers une page en mettant à jour les onglets et les sections.
 * @param {string} pageId  - ID de la div.page cible
 * @param {HTMLElement} tabEl - Élément .ptab cliqué
 */
function goPage(pageId, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  el(pageId).classList.add('active');
  if (tabEl) tabEl.classList.add('active');
}

/**
 * Rend le bandeau récapitulatif après chargement du fichier.
 * @param {string} filename - Nom du fichier chargé
 */
function renderBanner(filename) {
  const actionsJour = D.rows.filter(r => r.date_d === D.lastDate).length;

  el('banner').innerHTML = `
    <span>📂 <b style="color:var(--white);font-family:var(--m)">${filename}</b></span>
    <span>📊 <b style="color:var(--white)">${D.rows.length.toLocaleString('fr')}</b> événements</span>
    <span>💳 <b style="color:var(--white)">${D.cards.size.toLocaleString('fr')}</b> cartes</span>
    <span>📅 Période : <b style="color:var(--white)">${fD(D.dates[D.dates.length - 1])}</b>
          → <b style="color:var(--white)">${fD(D.lastDate)}</b></span>
    <span>🕐 Dernier jour : <b style="color:var(--cyan)">${fD(D.lastDate)}</b>
          · <b style="color:var(--cyan)">${actionsJour}</b> actions</span>`;
}
