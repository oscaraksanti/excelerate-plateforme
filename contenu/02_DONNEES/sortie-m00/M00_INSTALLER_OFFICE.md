# Installer Office 2024 proprement — la check-list
### À garder ouverte à côté de la vidéo

> **Deux choses distinctes, et on les confond tout le temps :** *installer* le logiciel, et *avoir le droit de s'en servir*. La procédure ci-dessous installe. La licence, c'est la dernière étape — et il n'y a pas de raccourci.

---

## Avant de commencer — avez-vous vraiment besoin de ça ?

| Votre situation | Ce que je vous conseille |
|---|---|
| Vous voulez juste **commencer ce soir** | [office.com](https://www.office.com) — Excel dans le navigateur, gratuit, sans limite de durée |
| Vous avez une **adresse d'école ou d'université** | [Microsoft 365 Éducation](https://www.microsoft.com/fr-fr/education/products/office) — licence complète, gratuite |
| Vous travaillez en **entreprise** | demandez à votre service informatique : beaucoup de licences dorment |
| Vous avez **acheté** une licence | la procédure ci-dessous |

---

## ① Désinstaller complètement les anciennes versions

- [ ] `Paramètres > Applications > Applications et fonctionnalités`
- [ ] Désinstaller **toutes** les versions de Microsoft Office présentes
- [ ] **Redémarrer l'ordinateur**
- [ ] Si des restes subsistent : l'[Assistant de récupération et support Microsoft](https://aka.ms/SaRA-officeUninstall) nettoie ce que la désinstallation classique laisse

> 🔴 **C'est l'étape qu'on saute, et c'est celle qui casse tout.** Deux versions d'Office sur la même machine, ce sont des fonctions qui disparaissent, des fichiers qui s'ouvrent dans la mauvaise application, et des heures perdues à chercher pourquoi.

## ② Préparer l'environnement

- [ ] Connexion internet stable — le téléchargement fait plusieurs gigaoctets
- [ ] **10 Go** d'espace disque libre au minimum
- [ ] Créer le dossier `C:\Office2024`
- [ ] Vérifier que vous avez les **droits administrateur**

## ③ Télécharger l'Office Deployment Tool

- [ ] Depuis le **site officiel de Microsoft** — jamais depuis un site tiers
- [ ] Exécuter le fichier téléchargé : il demande où extraire
- [ ] Extraire dans `C:\Office2024`

*L'ODT est l'outil d'installation de Microsoft pour les entreprises. Il est public, gratuit et signé.*

## ④ Configurer avec l'Office Customization Tool

- [ ] Ouvrir l'**Office Customization Tool** *(en ligne, chez Microsoft)*
- [ ] Choisir :
  - **Version** : Office LTSC 2024 *(ou Microsoft 365 Apps selon votre licence)*
  - **Architecture** : 64 bits
  - **Applications** : Excel, Word, PowerPoint — décochez le reste, c'est autant de gigaoctets en moins
  - **Langue** : français *(et anglais si vous voulez les deux)*
- [ ] Exporter le fichier **`configuration.xml`**
- [ ] Le copier dans `C:\Office2024`

## ⑤ Lancer l'installation

- [ ] Ouvrir l'**Invite de commandes en tant qu'administrateur**
- [ ] `cd C:\Office2024`
- [ ] `setup.exe /configure configuration.xml`
- [ ] Attendre — comptez vingt à quarante minutes selon la connexion
- [ ] Ouvrir Excel et **se connecter avec le compte Microsoft qui porte la licence**

---

## ⑥ Vérifier que tout est là — deux minutes

- [ ] `Fichier > Compte > À propos d'Excel` : le numéro de version s'affiche
- [ ] Dans une cellule vide, taper `=RECHERCHEX(` → l'autocomplétion la propose
- [ ] Onglet **Données** : le groupe *Récupérer et transformer* est présent *(Power Query)*
- [ ] `Fichier > Options > Compléments > Compléments COM` : **Power Pivot** est dans la liste
- [ ] `Fichier > Options > Personnaliser le ruban` : cocher **Développeur**

---

## Sur la licence — ce que je dis, et ce que je ne dis pas

Office 2024 **n'est pas gratuit**. Les voies légales sont au nombre de quatre :

1. **Excel pour le web** — gratuit, sans limite de durée, suffisant pour démarrer
2. **Microsoft 365 Éducation** — gratuit avec une adresse d'établissement
3. **La licence de votre employeur** — souvent disponible, rarement demandée
4. **L'achat** — abonnement Microsoft 365, ou Office 2024 en licence perpétuelle

> **Vous trouverez en ligne des « activateurs » qui prétendent débloquer Office gratuitement. Je ne les relaie pas.**
>
> Ce sont des scripts qui modifient le système en profondeur ; personne ne sait exactement ce qu'ils font ; et ils n'ont rien à faire sur une machine où vivent les données de votre employeur ou de vos clients.
>
> **Si le budget est le problème, la réponse est la voie 1 ou la voie 2** — pas un contournement. Excel pour le web vous fait démarrer ce soir, gratuitement et légalement.

---

## Sur Mac

Rien de tout ceci. L'installation passe par le **Mac App Store** ou par [office.com](https://www.office.com) une fois connecté au compte qui porte la licence.

Deux limites à connaître, et elles sont réelles :

- **Power Pivot n'existe pas** → le module 8 demande un poste Windows, ou se suit en observation
- **VBA est incomplet** → pas de `FileSystemObject`, pas de `FileDialog`. Le module 10 en tient compte et donne le code compatible

Les deux modules le disent en tête, et les deux ont un chemin de repli écrit dans leur énoncé.
