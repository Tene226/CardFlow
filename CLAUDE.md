# CLAUDE.md — CardFlow

Guide de référence pour Claude Code. À mettre à jour à chaque évolution significative du projet.

---

## Présentation

**CardFlow** est un outil métier 100 % front-end (HTML/CSS/JS vanilla, aucun framework, aucun backend) permettant d'analyser des extractions AMPLITUDE au format XLSX liées aux cartes VISA.

- Dépôt GitHub : `https://github.com/Tene226/CardFlow`
- Branche principale : `master`
- Déploiement : à configurer via GitHub Pages (dépôt actuellement privé)

---

## Architecture des fichiers

```
├── index.html              Point d'entrée unique
├── css/
│   └── styles.css          Design system complet (thème clair + sombre)
└── js/
    ├── config.js           Constantes globales (PAGE_SIZE, SC, PAL, CD, CHS)
    ├── state.js            État global unique → objet D
    ├── utils.js            Fonctions utilitaires pures (el, esc, bdg, fD, fH, fDate…)
    ├── loader.js           Chargement XLSX, drag & drop, normalisation, traçabilité import
    ├── table.js            Moteur pagination/tri (renderPage, sortView, changePage)
    ├── export.js           Export XLSX des vues filtrées (SheetJS)
    ├── app.js              Navigation, KPI strip global, fonctions reset filtres
    └── pages/
        ├── today.js        Page "Activité du jour"
        ├── statuts.js      Page "Statuts actuels"
        ├── journal.js      Page "Journal complet"
        ├── timeline.js     Page "Historique carte"
        └── stats.js        Page "Statistiques & Anomalies"
```

**Ordre de chargement des scripts** (important — dépendances implicites) :
`config → state → utils → loader → table → export → today → statuts → journal → timeline → stats → app`

---

## État global (js/state.js)

Tout passe par l'objet `D` — jamais de données dans le DOM.

```js
D.rows        // [] — tous les événements normalisés
D.cards       // Map<ref, { last, events[] }> — une entrée par carte
D.dates       // [] — dates distinctes triées DESC
D.lastDate    // string — date la plus récente
D.views       // { today, statuts, journal } — chaque vue : { data, filtered, page, sortCol, sortAsc }
D.statFilter  // string|null — filtre statut actif page Statuts
```

---

## Flux de données

1. `loadFile()` / `handleDrop()` → `processWorkbook()` → `normaliseRow()` → `D.rows`
2. `buildCardMap()` → `D.cards`
3. `buildDateList()` → `D.dates`, `D.lastDate`
4. Chaque page filtre ses données et appelle `renderPage(name)` via `table.js`

---

## Conventions de développement

### Fonctions utilitaires clés
| Fonction | Rôle |
|---|---|
| `el(id)` | `document.getElementById(id)` |
| `esc(s)` | Échappe HTML (anti-XSS) — **toujours utiliser pour les données utilisateur** |
| `bdg(statut)` | Génère un badge coloré via `SC` |
| `fD(d)` | Formate date `YYYY/MM/DD` → `YYYY-MM-DD` |
| `fH(h)` | Formate heure brute → `HH:MM:SS` |
| `fDate(d)` | Formate date d'expiration |
| `mkC(id, cfg)` | Crée/remplace un graphique Chart.js (détruit l'ancien) |
| `debounce(fn, ms)` | Anti-rebond pour les champs de recherche |

### Ajouter une nouvelle table/vue
1. Ajouter une entrée dans `VIEWS_CFG` dans `table.js` (tbody, pager, rc, rowFn)
2. Ajouter dans `ROW_GETTERS` pour le tri et l'export
3. Ajouter dans `D.views` dans `state.js`
4. Créer la fonction `rowXxx(r)` dans le fichier de page correspondant
5. Ajouter dans `EXPORT_CFG` dans `export.js`

### Sécurité
- **Toujours** utiliser `esc()` pour afficher des données issues du fichier XLSX dans le DOM
- Ne jamais utiliser `innerHTML` avec des données brutes non échappées

---

## Design system (css/styles.css)

### Thèmes
- **Thème clair** (défaut) : variables `:root`
- **Thème sombre** : variables `[data-theme="dark"]`
- Toggle via le bouton dans la nav → `toggleTheme()` dans `index.html`
- Persistance : `localStorage.getItem('cf-theme')`
- Appliqué dès le `<head>` pour éviter le flash

### Variables CSS principales
| Variable | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | `#F8FAFC` | `#070d1a` | Fond page |
| `--bg2` | `#FFFFFF` | `#0c1526` | Cards, nav |
| `--bg3` | `#F1F5F9` | `#111d30` | Inputs, thead |
| `--b` | `#E2E8F0` | `rgba(60,120,200,.14)` | Bordures |
| `--white` | `#0F172A` | `#dce8f5` | Texte principal |
| `--sub` | `#475569` | `#4e6a8c` | Texte secondaire |
| `--navy` | `#0F172A` | `#dce8f5` | Titres forts |
| `--blue` | `#1D4ED8` | `#3b82f6` | Accent principal |

### Navigation
La nav est toujours **dark** (`background: #0F172A`) quelle que soit le thème — identité de marque.

### Couleurs des statuts
Définies dans `SC` (config.js) : `SC['Nom du statut'] = ['couleur texte', 'couleur fond']`.
Utilisées par `bdg()`, la grille statuts, et la timeline.

---

## Fonctionnalités actuelles

| Page | Fonctionnalité |
|---|---|
| Accueil | Guide 3 étapes, drag & drop, panel traçabilité import |
| Toutes | KPI strip global (6 indicateurs) après chargement |
| Activité du jour | Sélecteur date, 8 KPIs, 2 graphiques, tableau filtrable, reset |
| Statuts actuels | Bandeau alerte "(Non renseigné)", grille cliquable, tableau, reset |
| Journal complet | Filtres multi (action, agence, opérateur, dates), tableau, reset |
| Historique carte | Recherche ref/compte/PAN/nom, timeline visuelle, fiche carte |
| Statistiques | 8 KPIs, 5 graphiques, anomalies enrichies (criticité, dates, agence) |
| Export | XLSX avec colonnes date au format `DD/MM/YYYY` (type Date Excel) |

---

## Points d'attention

- `VIEWS_CFG` dans `table.js` référence `rowToday`, `rowStatuts`, `rowJournal` via des wrappers lambda (`r => rowXxx(r)`) pour éviter l'erreur TDZ (ces fonctions sont chargées après `table.js`).
- `SC` dans `config.js` doit être tenu à jour si de nouveaux statuts AMPLITUDE apparaissent.
- Les colonnes de date dans l'export (`date_d`, `expir`) passent par `parseExcelDate()` pour être de vraies cellules Date Excel.
- Le thème sombre surcharge les variables mais **pas** les couleurs hard-codées de la nav (intentionnel).
