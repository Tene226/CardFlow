/**
 * pages/timeline.js
 * Page "Historique carte" — recherche par réf., compte, PAN ou nom + chronologie visuelle.
 */

/** Déclenché par le bouton Rechercher ou la touche Entrée. */
function searchCard() {
  const q = el('tl-q').value.trim().toLowerCase();

  el('tl-result').style.display = 'none';
  el('tl-empty').style.display  = 'none';
  el('tl-multi').style.display  = 'none';
  el('tl-hint').style.display   = 'none';

  if (!q) return;

  const matches = [...D.cards.entries()].filter(([ref, c]) =>
    ref.toLowerCase()             === q ||
    c.last.compte.toLowerCase()   === q ||
    c.last.pan.toLowerCase().includes(q) ||
    c.last.embossage.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    el('tl-empty').style.display = 'block';
    return;
  }

  if (matches.length === 1) {
    showTimeline(matches[0][0]);
    return;
  }

  // Plusieurs correspondances → afficher un tableau de sélection
  showMultipleResults(matches);
}

/** Affiche la liste des cartes correspondant à la recherche. */
function showMultipleResults(matches) {
  el('tl-multi').style.display = 'block';
  el('bd-multi').innerHTML = matches.map(([ref, c]) => `
    <tr style="cursor:pointer" data-ref="${esc(ref)}">
      <td class="m">${esc(c.last.agence)}</td>
      <td class="m">${esc(c.last.compte)}</td>
      <td class="m">${esc(ref)}</td>
      <td class="m">${esc(c.last.pan)}</td>
      <td>${esc(c.last.embossage)}</td>
      <td style="color:var(--sub);font-size:11px">${esc(c.last.libelle)}</td>
      <td>${bdg(c.last.statut)}</td>
      <td class="m" style="color:var(--cyan)">${c.events.length}</td>
    </tr>`).join('');
  el('bd-multi').querySelectorAll('tr[data-ref]').forEach(tr => {
    tr.addEventListener('click', () => showTimeline(tr.dataset.ref));
  });
}

/**
 * Affiche la chronologie complète d'une carte.
 * @param {string} ref - Référence de la carte
 */
function showTimeline(ref) {
  el('tl-multi').style.display = 'none';
  el('tl-empty').style.display = 'none';

  const c = D.cards.get(ref);
  if (!c) return;

  const l = c.last;
  renderTimelineHeader(ref, l, c.events.length);
  renderTimelineEvents(c.events);
  el('tl-result').style.display = 'block';
}

function renderTimelineHeader(ref, l, nbEvents) {
  el('tl-hdr').innerHTML = `
    <div class="f"><label>Réf. Carte</label><span>${esc(ref)}</span></div>
    <div class="f"><label>Compte</label><span>${esc(l.compte)}</span></div>
    <div class="f"><label>Titulaire</label><span>${esc(l.embossage)}</span></div>
    <div class="f"><label>PAN</label><span>${esc(l.pan)}</span></div>
    <div class="f"><label>Type</label><span style="color:var(--sub2)">${esc(l.libelle)}</span></div>
    <div class="f"><label>Agence</label><span>${esc(l.agence)}</span></div>
    <div class="f"><label>Statut actuel</label><span>${bdg(l.statut)}</span></div>
    <div class="f"><label>Expiration</label><span>${fDate(l.expir)}</span></div>
    <div class="f"><label>Événements</label><span style="color:var(--cyan)">${nbEvents}</span></div>`;
}

function renderTimelineEvents(events) {
  el('tl-wrap').innerHTML = `<div class="timeline">${
    events.map(ev => {
      const [fg]   = SC[ev.action] || ['#4e6a8c'];
      const isLast = ev.date_d === D.lastDate;
      return `<div class="tl-item">
        <div class="tl-dot" style="background:${fg}"></div>
        <div class="tl-box${isLast ? ' tl-today' : ''}">
          <span class="tl-date">${fD(ev.date_d)}</span>
          <span style="color:var(--sub2);font-family:var(--m);font-size:11px">${fH(ev.heure)}</span>
          ${bdg(ev.action)}
          ${ev.uti ? `<span class="uti">${ev.uti}</span>` : ''}
          ${isLast ? `<span style="font-family:var(--m);font-size:10px;color:var(--gold)">★ dernier jour</span>` : ''}
        </div>
      </div>`;
    }).join('')
  }</div>`;
}
