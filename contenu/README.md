# CONTENU — EXCELERATE IA
### Le squelette complet du programme · 17 septembre 2026

> **Par où commencer :** [`00_PLAN-MAITRE.md`](00_PLAN-MAITRE.md). C'est la source de vérité.
> Toute décision qui contredit ce fichier doit d'abord y être écrite.

---

## L'arborescence

| | Contenu | État |
|---|---|:--:|
| **[`00_PLAN-MAITRE.md`](00_PLAN-MAITRE.md)** | Stratégie, calendrier, lois, méthodes, offre, risques | ✅ |
| **`01_PILOTAGE/`** | | |
| ├ [`CALENDRIER.md`](01_PILOTAGE/CALENDRIER.md) | Production et diffusion, jour par jour, du 17/09 au 03/10 | ✅ |
| ├ [`SUIVI-PRODUCTION.md`](01_PILOTAGE/SUIVI-PRODUCTION.md) | L'état des 60 leçons, à cocher | ✅ |
| ├ [`CONVENTIONS.md`](01_PILOTAGE/CONVENTIONS.md) | Structure des leçons, nommage, tournage, **contrôle d'accès dans l'admin** | ✅ |
| ├ [`MATRICE-COMPATIBILITE.md`](01_PILOTAGE/MATRICE-COMPATIBILITE.md) | Versions d'Excel, pièges, parades | ⚠️ à vérifier sur machines réelles |
| └ [`GLOSSAIRE-FR-EN.md`](01_PILOTAGE/GLOSSAIRE-FR-EN.md) | Les fonctions, FR ↔ EN | ✅ |
| **`02_DONNEES/`** | | |
| └ [`BAOBAB.md`](02_DONNEES/BAOBAB.md) | L'univers, les personnages, **la spécification des jeux de données** | ✅ |
| **`03_MODULES/`** | 12 fichiers : Atelier, Mise à niveau, Modules 1 à 10 | ✅ squelette · corps à rédiger |
| **`04_TP/`** | | |
| ├ [`00_REGLE-DE-CONCEPTION.md`](04_TP/00_REGLE-DE-CONCEPTION.md) | 🔴 **À lire avant de fabriquer le moindre classeur** | ✅ |
| ├ `TP-01.md` → `TP-03.md` | Les TP gratuits, **cellules et formules spécifiées** | ✅ |
| ├ `TP-04.md` → `TP-10.md` | Les TP payants, spécifiés | ✅ |
| └ [`CAPSTONE.md`](04_TP/CAPSTONE.md) | Le projet final | ✅ |
| **`05_QCM/`** | | |
| ├ [`00_FORMAT.md`](05_QCM/00_FORMAT.md) | Le format, et pourquoi il existe | ✅ |
| ├ `QCM-M01` → `M03` | **18 questions rédigées**, prêtes à saisir | ✅ |
| └ `QCM-M04` → `M10` | Les 6 sujets par module | ✅ squelette |
| **`06_LIVES/`** | Les 4 lives gratuits minute par minute + les 5 lives masterclass | ✅ |
| **`07_OFFRE/`** | [`SEQUENCE-CONVERSION.md`](07_OFFRE/SEQUENCE-CONVERSION.md) · [`ARGUMENTAIRE.md`](07_OFFRE/ARGUMENTAIRE.md) | ✅ |

---

## Les six décisions structurantes

1. **Les 3 jours gratuits tiennent la promesse déjà vendue** à 1 837 inscrits : tableaux structurés, `RECHERCHEX`, `FILTRE`/`TRIER`/`UNIQUE` dès le premier soir. Le niveau débutant est dans « Mise à niveau », en accès libre, jamais dans les lives.

2. **Les modules 5 à 10 sortent un par jour du 28 septembre au 3 octobre**, chacun avec son live. **Le module 4 est ouvert dès l'achat.** Le calendrier est écrit sur la page de vente avant le premier paiement.

3. **Un TP est un classeur à trous.** La plateforme note en comparant les formules à un corrigé. Voir `04_TP/00_REGLE-DE-CONCEPTION.md`.

4. **Claude Code sort entièrement du gratuit.** Il devient le bonus des 50 premiers acheteurs et le sujet des modules 8 à 10.

5. **Le QCM existe parce que le replay se regarde sur un téléphone.** 6 questions, correction immédiate, aucun seuil bloquant.

6. **Le certificat à 27 $ n'apparaît jamais le mercredi.** Il sort le vendredi 25, en rattrapage, vers les non-acheteurs uniquement.

---

## Ce qui reste à faire

### Phase 2 — rédaction, module par module
- [ ] Le **corps markdown** de chaque leçon *(le support écrit, à coller dans l'admin)*
- [ ] Les **scripts de tournage** `_SCRIPT.md`
- [ ] Les **prompts** `_PROMPTS.md` des leçons IA
- [ ] Les **42 questions de QCM** restantes *(modules 4 à 10)*

### Phase 3 — fabrication
- [ ] Le **générateur de données BAOBAB** *(graine aléatoire fixe)*
- [ ] Les classeurs `_DEPART` et `_CORRIGE` de chaque leçon
- [ ] Les 3 TP gratuits, **testés dans le correcteur : le corrigé doit se noter 20/20**

### Côté plateforme
- [ ] Le **moteur de QCM**
- [ ] Les **6 critères de correction entre pairs**, alignés sur la nouvelle grille
- [ ] Les 12 modules renommés · les dates de publication posées
- [ ] Le **compte à rebours du panier** *(fermeture dimanche 27, 23 h 59 GMT)*

### Décisions en attente
- [ ] Confirmer les deux clauses commerciales des CGV *(durée d'accès, garantie 14 jours)*
- [ ] **Réinitialiser le mot de passe de la base de données**
- [ ] Faire le paiement Chariow de test, de bout en bout
