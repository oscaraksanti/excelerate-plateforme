# Base et authentification — mise en service

Ordre à respecter. Chaque étape suppose la précédente faite.

## 1. Le socle de la base

Supabase → **SQL Editor** → nouvelle requête → coller tout
`migrations/0001_socle.sql` → Run.

Le fichier est rejouable : s'il est exécuté deux fois, rien ne casse.

Vérification : Table Editor doit lister 13 tables, toutes avec le cadenas
« RLS enabled ».

## 2. Les adresses autorisées

Authentication → **URL Configuration**

- Site URL : `https://excelai.oscaraksanti.com`
- Redirect URLs : `https://excelai.oscaraksanti.com/**`

Sans cette liste, Supabase refuse de renvoyer vers la plateforme et le
lien tombe sur une page d'erreur.

## 3. L'envoi des emails

Resend → Domains → ajouter `mail.excelai.oscaraksanti.com`, puis coller
les enregistrements DNS donnés dans **Hostinger → Zone DNS**.

Supabase → Authentication → **SMTP Settings** :

| Champ | Valeur |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | la clé API Resend |
| Sender email | `oscar@mail.excelai.oscaraksanti.com` |
| Sender name | `Oscar Aksanti` |

## 4. La limite d'envoi — l'étape que tout le monde saute

Authentication → **Rate Limits** → remonter « Rate limit for sending
emails ».

Supabase garde sa limite basse **même après** avoir branché un SMTP
externe. Par défaut, ça bloque au bout de quelques dizaines d'envois :
le soir du lancement, des centaines de personnes cliqueraient sans
jamais rien recevoir.

## 5. Le gabarit du lien de connexion

Authentication → Emails → **Magic Link** → remplacer le contenu par
`templates/lien-magique.html`.

Objet : `Ton lien de connexion — Excelerate IA`

Ce gabarit utilise `{{ .TokenHash }}` et non `{{ .ConfirmationURL }}`.
C'est le seul montage qui marche quand quelqu'un demande le lien sur son
ordinateur et l'ouvre sur son téléphone. Ne pas revenir au gabarit par
défaut.

## 6. Le feu vert

Cinq personnes réelles, sur cinq téléphones différents, reçoivent leur
lien et se connectent — dont au moins une adresse Gmail et une Yahoo.
