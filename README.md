# CardFlow — Tableau de bord

Application de suivi journalier des extractions SMARTVISTA (historique cartes VISA).

---

## Structure du projet

```
cardflow/
├── index.html              → Structure HTML uniquement
├── css/
│   └── styles.css          → Tous les styles
└── js/
    ├── config.js           → Constantes (couleurs, palette, options Chart.js)
    ├── state.js            → État global de l'application (D{})
    ├── utils.js            → Fonctions utilitaires pures (helpers)
    ├── loader.js           → Chargement XLSX et normalisation des données
    ├── table.js            → Moteur de pagination et de tri (toutes les tables)
    ├── export.js           → Exports CSV
    ├── app.js              → Navigation entre pages, bannière
    └── pages/
        ├── today.js        → Page "Activité du jour"
        ├── statuts.js      → Page "Statuts actuels"
        ├── journal.js      → Page "Journal complet"
        ├── timeline.js     → Page "Historique carte"
        └── stats.js        → Page "Statistiques"
```

---

## Démarrage

Les navigateurs bloquent les imports de fichiers JS locaux pour des raisons
de sécurité (politique CORS sur file://). Il faut servir l'application
via un petit serveur HTTP local.

### Option 1 — Python (recommandé, aucune installation)

```bash
cd cardflow
python -m http.server 8000
```
Puis ouvrir : http://localhost:8000

### Option 2 — Node.js

```bash
npx serve cardflow
```

### Option 3 — VS Code
Installer l'extension "Live Server", clic droit sur index.html → "Open with Live Server".

---

## Utilisation

1. Démarrer le serveur (voir ci-dessus)
2. Ouvrir http://localhost:8000 dans le navigateur
3. Cliquer sur la zone de dépôt et charger un fichier XLSX extrait de SMARTVISTA
4. Naviguer entre les 5 onglets

---

## Compatibilité fichier source

Le programme accepte deux formats d'extraction :
- **Nouveau format** (recommandé) : colonnes ACTION, DATE_ACTION, UTI_ACTION, STATUT ACTUELLE
- **Ancien format** : colonne STATUT uniquement (fonctionnalités réduites)

---

## Ajouter une nouvelle colonne

1. `js/loader.js` → ajouter le champ dans `normaliseRow()`
2. `js/table.js`  → ajouter la valeur dans le getter `ROW_GETTERS`
3. `js/export.js` → ajouter dans `EXPORT_CFG`
4. `js/pages/xxx.js` → ajouter dans la fonction `rowXxx()`
5. `index.html`   → ajouter le `<th>` dans l'en-tête de la table concernée
