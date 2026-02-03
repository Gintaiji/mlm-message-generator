# TASKS – Mini CRM / Générateur de messages

## Objectif global
Améliorer la productivité (relances, tri, recherche) sans complexifier l’outil.
Contraintes : 1 fichier `index.html`, sans dépendances, offline, compatible mobile.

---

## P0 – Indispensable (gain immédiat)
### P0.1 – Tri par urgence (prochaine_relance)
**But :** afficher les contacts les plus urgents en haut.
**DONE :**
- [ ] Trier la liste par `prochaine_relance` croissante
- [ ] Les dates vides vont en bas
- [ ] Un contact en retard (<= aujourd’hui) est visuellement marqué (ex : badge "URGENT")

### P0.2 – Filtre “À relancer” (aujourd’hui ou avant)
**But :** voir uniquement ce qui doit être relancé.
**DONE :**
- [ ] Ajouter un toggle : “À relancer (<= aujourd’hui)”
- [ ] Quand activé : n’afficher que les contacts avec `statut="À relancer"` ET `prochaine_relance <= aujourd’hui`
- [ ] Le toggle ne casse pas la sélection d’un contact

### P0.3 – Recherche rapide
**But :** retrouver un contact en 2 secondes.
**DONE :**
- [ ] Champ recherche (filtre en live)
- [ ] Recherche sur `prenom` + `note` + `plateforme`
- [ ] La recherche fonctionne avec le tri et le filtre activés

---

## P1 – Confort & workflow
### P1.1 – Actions rapides sur un contact
**But :** gagner du temps en suivi.
**DONE :**
- [ ] Bouton “Marquer comme Répondu” (change statut)
- [ ] Bouton “Relancer +7j” (statut à relancer + prochaine_relance recalculée)
- [ ] Bouton “Relancer +14j” (idem)

### P1.2 – Auto-statuts selon le temps
**But :** rendre la liste intelligente.
**DONE :**
- [ ] Si `prochaine_relance` est passée et statut = "À relancer" → badge "EN RETARD"
- [ ] Option : basculer automatiquement le statut en "À relancer" si prochaine_relance approche (J-1)

### P1.3 – Anti-doublons amélioré
**But :** éviter d’écraser des gens différents.
**DONE :**
- [ ] Ajouter un champ optionnel “pseudo” ou “identifiant”
- [ ] Utiliser (pseudo + plateforme) comme clé principale si pseudo rempli
- [ ] Sinon fallback (prenom + plateforme)

---

## P2 – Fiabilité (qualité pro)
### P2.1 – Import CSV robuste
**DONE :**
- [ ] Gérer colonnes manquantes sans planter
- [ ] Accepter les CSV avec colonnes dans un ordre différent
- [ ] Alerte claire si format invalide

### P2.2 – Export CSV propre
**DONE :**
- [ ] Échapper correctement les guillemets/virgules/retours à la ligne
- [ ] Ajouter un export “backup complet” (identique mais confirmé)

### P2.3 – Prévention d’erreurs UX
**DONE :**
- [ ] Confirmation avant suppression
- [ ] Alerte si on enregistre un contact sans prénom
- [ ] Indication “Modifications non sauvegardées” si le formulaire change

---

## P3 – Bonus (plus tard)
- [ ] Statistiques : nb de contacts / nb à relancer / nb en retard
- [ ] Templates personnalisés (l’utilisateur peut écrire ses propres phrases)
- [ ] Export “messages du jour” (liste des relances à faire aujourd’hui)
