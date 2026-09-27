-- ═══════════════════════════════════════════════════════════════════
--  Les appareils reconnus
--
--  Sur 324 reconnexions, 79 ont eu lieu en moins d'une heure. Personne
--  ne se déconnecte en dix minutes : ces gens-là avaient simplement
--  changé de fenêtre. Et chaque reconnexion coûte un courriel — 85 des
--  100 derniers envois étaient des liens de connexion.
--
--  La session Supabase, elle, fonctionne : cookies de 400 jours,
--  aucune expiration côté serveur, durée constatée de 40 h en moyenne
--  et jusqu'à 9 jours. Le manque n'est donc pas la durée : c'est qu'il
--  n'existe rien pour rouvrir une session éteinte sans repasser par la
--  boîte mail.
--
--  Ce jeton comble ça. Posé à la première connexion, gardé sous forme
--  d'empreinte — la base ne peut pas le rejouer, même lue en entier —
--  il permet au serveur de rouvrir une session en silence.
--
--  Il vaut pour UN navigateur. « Sortir » ne révoque que celui-là :
--  se déconnecter au bureau ne doit pas déconnecter le téléphone.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.appareils (
  id          uuid primary key default gen_random_uuid(),
  profil_id   uuid not null references public.profils(id) on delete cascade,
  empreinte   text not null unique,
  agent       text,
  cree_le     timestamptz not null default now(),
  vu_le       timestamptz not null default now(),
  revoque_le  timestamptz
);

comment on table public.appareils is
  'Un navigateur reconnu. Le jeton n''est jamais stocké en clair : seule son empreinte SHA-256 est ici.';
comment on column public.appareils.empreinte is
  'SHA-256 du jeton posé dans le cookie. Une fuite de cette table ne permet de se connecter nulle part.';
comment on column public.appareils.revoque_le is
  'Rempli par une déconnexion volontaire, ou depuis le profil. Un appareil révoqué ne rouvre plus rien.';

create index if not exists idx_appareils_profil on public.appareils(profil_id)
  where revoque_le is null;

alter table public.appareils enable row level security;

--  Chacun voit ses appareils — c'est ce qui permet de les révoquer
--  depuis son profil. Personne ne les écrit depuis le navigateur :
--  la pose et la révocation passent par le serveur.
drop policy if exists "appareils : je lis les miens" on public.appareils;
create policy "appareils : je lis les miens" on public.appareils
  for select to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());
