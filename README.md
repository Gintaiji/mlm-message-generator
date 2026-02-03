# Mini CRM – Générateur de messages (MLM)

## Description
Outil simple en HTML/CSS/JavaScript pour :
- générer des messages brise-glace et de relance (style humain, anti-robot),
- gérer une liste de contacts (mini CRM),
- suivre les statuts et dates de relance,
- importer / exporter les contacts au format CSV.

Le projet est pensé pour un usage terrain (MLM, réseau, prospection), sans backend.

---

## Utilisation
1. Ouvrir le fichier `index.html` dans un navigateur (Chrome, Edge, Firefox).
2. Remplir les champs (contact, objectif, style, etc.).
3. Générer un message ou enregistrer le contact.
4. Exporter les contacts en CSV pour Google Sheets / Excel si besoin.

Aucune installation, aucun serveur requis.

---

## Technologies
- HTML
- CSS
- JavaScript vanilla
- Stockage local via `localStorage`
- Un seul fichier : `index.html`

---

## Contraintes du projet (IMPORTANT)
- ❗ Un seul fichier (`index.html`)
- ❗ Aucune dépendance externe (framework, CDN, backend)
- ❗ Fonctionne hors ligne
- ❗ Compatible mobile
- ❗ Le format CSV existant ne doit pas être cassé
- ❗ Les fonctionnalités existantes doivent continuer à fonctionner

---

## Tests manuels rapides
- Ajouter un contact avec statut "À relancer" → vérifier la date de prochaine relance automatique.
- Générer un message (différents styles / longueurs).
- Exporter le CSV → ouvrir dans Google Sheets.
- Importer le même CSV → vérifier que les contacts sont bien restaurés.
