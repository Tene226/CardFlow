/**
 * utils.js
 * Fonctions utilitaires pures — pas d'état, pas d'effets de bord.
 * Disponibles globalement pour tous les autres modules.
 */

/** Raccourci getElementById */
function el(id) {
  return document.getElementById(id);
}

/** Génère un badge coloré selon le statut */
function bdg(statut) {
  const [fg, bg] = SC[statut] || ['#4e6a8c', 'rgba(78,106,140,.15)'];
  return `<span class="bx" style="color:${fg};background:${bg}">${statut || '—'}</span>`;
}

/** Formate une date YYYY/MM/DD → YYYY-MM-DD */
function fD(d) {
  return d ? String(d).replace(/\//g, '-') : '—';
}

/**
 * Formate une heure brute vers HH:MM:SS.
 * Gère deux formats présents dans le fichier source :
 *   - "092220"   (HHMMSS sans séparateurs, legacy SMARTVISTA)
 *   - "18:21:00" (HH:MM:SS avec séparateurs, nouveau format)
 */
function fH(h) {
  if (!h) return '—';
  h = h.replace(/\s/g, '');
  if (!h) return '—';
  if (h.includes(':'))       return h.slice(0, 8);          // déjà formaté
  if (h.length >= 6)         return `${h.slice(0,2)}:${h.slice(2,4)}:${h.slice(4,6)}`;
  if (h.length === 4)        return `${h.slice(0,2)}:${h.slice(2,4)}`;
  return h;
}

/** Formate une date d'expiration (Date JS ou chaîne) */
function fDate(d) {
  if (!d) return '—';
  if (d instanceof Date) return d.toLocaleDateString('fr-FR');
  return String(d).slice(0, 10).replace(/\//g, '-');
}

/** Compte les éléments d'un tableau où row[key] === val */
function cnt(arr, key, val) {
  return arr.filter(r => r[key] === val).length;
}

/** Groupe un tableau par valeur d'une clé → { valeur: count } */
function byKey(arr, key) {
  const m = {};
  for (const r of arr) m[r[key]] = (m[r[key]] || 0) + 1;
  return m;
}

/** Valeurs uniques d'un tableau */
function uniq(arr) {
  return [...new Set(arr)];
}

/** Peuple un <select> avec des options (conserve la première option vide) */
function fillSel(id, opts) {
  const s = el(id);
  const first = s.options[0];
  s.innerHTML = '';
  s.appendChild(first);
  opts.forEach(o => {
    const op = document.createElement('option');
    op.value = op.textContent = o;
    s.appendChild(op);
  });
}

/** Crée/remplace un graphique Chart.js */
function mkC(id, cfg) {
  if (CHS[id]) { CHS[id].destroy(); delete CHS[id]; }
  CHS[id] = new Chart(el(id).getContext('2d'), cfg);
}

/**
 * Debounce — évite de déclencher fn à chaque frappe dans un champ texte.
 * Usage dans HTML : oninput="debounce(maFonction, 250)"
 */
const _debounceTimers = {};
function debounce(fn, ms) {
  clearTimeout(_debounceTimers[fn.name]);
  _debounceTimers[fn.name] = setTimeout(fn, ms);
}
