-- ═══════════════════════════════════════════════════════════════════
--  Les captures d'écran dans le fil
--
--  « Voici mon écran » est la façon dont la plupart des questions Excel
--  se résolvent. Mais une capture d'écran Excel contient de vraies
--  données d'entreprise : des salaires, des noms de clients, des
--  chiffres d'affaires.
--
--  D'où un espace PRIVÉ, et une route qui vérifie que la personne a le
--  droit de voir cette leçon — exactement comme pour les copies de TP.
--  Un espace public, c'est une adresse qui fuit et qui reste ouverte
--  pour toujours.
-- ═══════════════════════════════════════════════════════════════════

alter table public.commentaires
  add column if not exists image text;

comment on column public.commentaires.image is
  'Chemin de la capture dans l''espace privé « captures ». Servie par /api/captures.';

--  5 Mo suffit largement : l'interface redimensionne avant d'envoyer.
--  Cette limite n'est qu'un dernier rempart, côté serveur.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('captures', 'captures', false, 5242880,
        array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

--  Aucune politique pour les apprenants : personne ne lit ni n'écrit
--  cet espace directement. Tout passe par le serveur, qui vérifie
--  d'abord. C'est le même choix que pour « depots ».
