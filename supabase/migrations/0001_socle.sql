-- ══════════════════════════════════════════════════════════════════════
--  EXCELERATE IA — socle de la base
--  Phase 1. Posé en une fois, y compris les tables qui ne serviront
--  qu'en octobre : les créer maintenant coûte dix minutes, les ajouter
--  plus tard coûte une migration sur des données vivantes.
--
--  À exécuter dans Supabase → SQL Editor. Rejouable sans risque.
-- ══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
--  1. LES GENS
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.profils (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  nom           text not null default '',
  telephone     text,
  role          text not null default 'apprenant' check (role in ('apprenant','admin')),
  origine       text not null default 'inscription' check (origine in ('inscription','import')),
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);

comment on column public.profils.role is
  'Ne jamais rendre modifiable depuis l''interface. Seul le service role l''écrit.';

-- ─────────────────────────────────────────────────────────────────────
--  2. LE CONTENU
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.modules (
  id       uuid primary key default gen_random_uuid(),
  numero   int  not null unique,
  titre    text not null,
  resume   text not null default '',
  acces    text not null default 'paye' check (acces in ('gratuit','paye')),
  publie   boolean not null default false,
  cree_le  timestamptz not null default now()
);

create table if not exists public.lecons (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid not null references public.modules(id) on delete cascade,
  numero        int  not null,
  titre         text not null,
  -- La source est un champ, pas une supposition : on basculera de YouTube
  -- à Cloudflare Stream en octobre sans réécrire une ligne.
  video_source  text check (video_source in ('youtube','stream')),
  video_id      text,
  duree_min     int,
  corps_md      text not null default '',
  publie        boolean not null default false,
  cree_le       timestamptz not null default now(),
  unique (module_id, numero)
);

create table if not exists public.ressources (
  id            uuid primary key default gen_random_uuid(),
  lecon_id      uuid not null references public.lecons(id) on delete cascade,
  nom           text not null,
  chemin        text not null,
  taille_octets bigint,
  ordre         int  not null default 0,
  cree_le       timestamptz not null default now()
);

create table if not exists public.progression (
  profil_id        uuid not null references public.profils(id) on delete cascade,
  lecon_id         uuid not null references public.lecons(id) on delete cascade,
  seconde_reprise  int  not null default 0,
  terminee         boolean not null default false,
  vue_le           timestamptz not null default now(),
  primary key (profil_id, lecon_id)
);

create table if not exists public.commentaires (
  id         uuid primary key default gen_random_uuid(),
  lecon_id   uuid not null references public.lecons(id) on delete cascade,
  profil_id  uuid not null references public.profils(id) on delete cascade,
  parent_id  uuid references public.commentaires(id) on delete cascade,
  corps      text not null check (char_length(corps) between 1 and 4000),
  masque     boolean not null default false,
  cree_le    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
--  3. LE TRAVAIL
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.tps (
  id                   uuid primary key default gen_random_uuid(),
  module_id            uuid not null references public.modules(id) on delete cascade,
  numero               int  not null,
  titre                text not null,
  enonce_md            text not null default '',
  fichier_depart       text,
  criteres             jsonb not null default '[]'::jsonb,
  corrections_requises int  not null default 3,
  ouvre_le             timestamptz,
  ferme_le             timestamptz,
  publie               boolean not null default false,
  cree_le              timestamptz not null default now(),
  unique (module_id, numero)
);

-- Table séparée, et non colonne de `tps` : c'est la garantie la plus
-- solide qu'aucun apprenant ne lise jamais un corrigé. Une requête mal
-- écrite côté application ne peut pas la faire fuiter.
create table if not exists public.corriges (
  tp_id   uuid primary key references public.tps(id) on delete cascade,
  chemin  text not null,
  grille  jsonb not null default '[]'::jsonb,
  maj_le  timestamptz not null default now()
);

create table if not exists public.copies (
  id              uuid primary key default gen_random_uuid(),
  tp_id           uuid not null references public.tps(id) on delete cascade,
  profil_id       uuid not null references public.profils(id) on delete cascade,
  chemin          text not null,
  nom_fichier     text,
  note_machine    numeric(5,2),
  detail_machine  jsonb,
  note_pairs      numeric(5,2),
  note_finale     numeric(5,2),
  depose_le       timestamptz not null default now(),
  unique (tp_id, profil_id)
);

create table if not exists public.attributions (
  id             uuid primary key default gen_random_uuid(),
  copie_id       uuid not null references public.copies(id) on delete cascade,
  correcteur_id  uuid not null references public.profils(id) on delete cascade,
  statut         text not null default 'en_attente' check (statut in ('en_attente','faite','expiree')),
  est_temoin     boolean not null default false,
  attribue_le    timestamptz not null default now(),
  unique (copie_id, correcteur_id)
);

create table if not exists public.corrections (
  id              uuid primary key default gen_random_uuid(),
  attribution_id  uuid not null unique references public.attributions(id) on delete cascade,
  copie_id        uuid not null references public.copies(id) on delete cascade,
  correcteur_id   uuid not null references public.profils(id) on delete cascade,
  notes           jsonb not null,
  total           numeric(5,2) not null,
  commentaire     text,
  poids           numeric(4,2) not null default 1.0,
  faite_le        timestamptz not null default now(),
  unique (copie_id, correcteur_id)
);

comment on column public.corrections.poids is
  'Baissé automatiquement si le correcteur note la copie témoin très loin de la vérité.';

-- ─────────────────────────────────────────────────────────────────────
--  4. L'ARGENT ET LA PREUVE
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.achats (
  id             uuid primary key default gen_random_uuid(),
  -- Nul tant que l'acheteur n'a pas de compte : on rattache par email.
  profil_id      uuid references public.profils(id) on delete set null,
  email          text not null,
  produit        text not null check (produit in ('certificat27','masterclass37','coaching97','equipe')),
  montant        numeric(10,2),
  devise         text not null default 'USD',
  -- Unique : si Chariow renvoie deux fois la même notification, rien
  -- n'est compté deux fois.
  chariow_ref    text not null unique,
  charge_utile   jsonb,
  paye_le        timestamptz not null default now()
);

create table if not exists public.certificats (
  id           uuid primary key default gen_random_uuid(),
  profil_id    uuid not null references public.profils(id) on delete cascade,
  code         text not null unique,
  niveau       text not null check (niveau in ('fondamentaux','avance')),
  nom_affiche  text not null,
  note         numeric(5,2),
  emis_le      timestamptz not null default now(),
  revoque_le   timestamptz
);

-- ─────────────────────────────────────────────────────────────────────
--  5. INDEX
-- ─────────────────────────────────────────────────────────────────────

create index if not exists idx_lecons_module      on public.lecons(module_id, numero);
create index if not exists idx_ressources_lecon   on public.ressources(lecon_id, ordre);
create index if not exists idx_progression_profil on public.progression(profil_id);
create index if not exists idx_commentaires_lecon on public.commentaires(lecon_id, cree_le desc);
create index if not exists idx_tps_module         on public.tps(module_id, numero);
create index if not exists idx_copies_tp          on public.copies(tp_id);
create index if not exists idx_copies_profil      on public.copies(profil_id);
create index if not exists idx_attrib_correcteur  on public.attributions(correcteur_id, statut);
create index if not exists idx_attrib_copie       on public.attributions(copie_id);
create index if not exists idx_corrections_copie  on public.corrections(copie_id);
create index if not exists idx_achats_email       on public.achats(lower(email));
create index if not exists idx_achats_profil      on public.achats(profil_id);
create index if not exists idx_profils_email      on public.profils(lower(email));

-- ─────────────────────────────────────────────────────────────────────
--  6. FONCTIONS D'AIDE
--  Toutes en SECURITY DEFINER avec search_path vide : sans ça, une
--  fonction qui interroge `profils` depuis une règle posée sur `profils`
--  part en récursion infinie.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.est_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profils p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.a_acces_paye()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.achats a
    where a.profil_id = (select auth.uid())
      and a.produit in ('masterclass37','coaching97','equipe')
  );
$$;

create or replace function public.module_visible(p_module uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.modules m
    where m.id = p_module
      and (
        public.est_admin()
        or (m.publie and (m.acces = 'gratuit' or public.a_acces_paye()))
      )
  );
$$;

create or replace function public.lecon_visible(p_lecon uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.lecons l
    where l.id = p_lecon
      and (public.est_admin() or (l.publie and public.module_visible(l.module_id)))
  );
$$;

-- Combien de copies cette personne a-t-elle déjà corrigées pour ce TP ?
-- C'est ce compteur qui porte le verrou « corrige trois copies avant de
-- voir ta note ».
create or replace function public.corrections_faites(p_tp uuid, p_profil uuid)
returns int
language sql stable security definer set search_path = ''
as $$
  select count(*)::int
  from public.corrections c
  join public.copies co on co.id = c.copie_id
  where c.correcteur_id = p_profil and co.tp_id = p_tp;
$$;

create or replace function public.verrou_leve(p_tp uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.corrections_faites(p_tp, (select auth.uid()))
         >= coalesce((select t.corrections_requises from public.tps t where t.id = p_tp), 3);
$$;

-- ─────────────────────────────────────────────────────────────────────
--  7. CRÉATION AUTOMATIQUE DU PROFIL
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.creer_profil()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profils (id, email, nom, telephone, role, origine)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    new.raw_user_meta_data ->> 'telephone',
    case
      when lower(new.email) in ('oscaraksanti@gmail.com', 'formations4data@gmail.com')
      then 'admin' else 'apprenant'
    end,
    coalesce(new.raw_user_meta_data ->> 'origine', 'inscription')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists sur_nouvel_utilisateur on auth.users;
create trigger sur_nouvel_utilisateur
  after insert on auth.users
  for each row execute function public.creer_profil();

-- Tenir `maj_le` à jour
create or replace function public.toucher_maj_le()
returns trigger language plpgsql set search_path = ''
as $$ begin new.maj_le = now(); return new; end; $$;

drop trigger if exists sur_maj_profil on public.profils;
create trigger sur_maj_profil before update on public.profils
  for each row execute function public.toucher_maj_le();

-- ─────────────────────────────────────────────────────────────────────
--  8. RÈGLES D'ACCÈS PAR LIGNE
--  Tout est fermé par défaut. On n'ouvre que ce qui est nécessaire.
-- ─────────────────────────────────────────────────────────────────────

alter table public.profils      enable row level security;
alter table public.modules      enable row level security;
alter table public.lecons       enable row level security;
alter table public.ressources   enable row level security;
alter table public.progression  enable row level security;
alter table public.commentaires enable row level security;
alter table public.tps          enable row level security;
alter table public.corriges     enable row level security;
alter table public.copies       enable row level security;
alter table public.attributions enable row level security;
alter table public.corrections  enable row level security;
alter table public.achats       enable row level security;
alter table public.certificats  enable row level security;

-- ── profils ──────────────────────────────────────────────────────────
drop policy if exists "profil : je lis le mien" on public.profils;
create policy "profil : je lis le mien" on public.profils
  for select to authenticated
  using (id = (select auth.uid()) or public.est_admin());

drop policy if exists "profil : je modifie le mien" on public.profils;
create policy "profil : je modifie le mien" on public.profils
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── modules / leçons / ressources ────────────────────────────────────
drop policy if exists "modules : lecture selon accès" on public.modules;
create policy "modules : lecture selon accès" on public.modules
  for select to authenticated
  using (public.est_admin() or (publie and (acces = 'gratuit' or public.a_acces_paye())));

drop policy if exists "modules : admin écrit" on public.modules;
create policy "modules : admin écrit" on public.modules
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

drop policy if exists "lecons : lecture selon accès" on public.lecons;
create policy "lecons : lecture selon accès" on public.lecons
  for select to authenticated
  using (public.est_admin() or (publie and public.module_visible(module_id)));

drop policy if exists "lecons : admin écrit" on public.lecons;
create policy "lecons : admin écrit" on public.lecons
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

drop policy if exists "ressources : suit la leçon" on public.ressources;
create policy "ressources : suit la leçon" on public.ressources
  for select to authenticated
  using (public.lecon_visible(lecon_id));

drop policy if exists "ressources : admin écrit" on public.ressources;
create policy "ressources : admin écrit" on public.ressources
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── progression ──────────────────────────────────────────────────────
drop policy if exists "progression : la mienne" on public.progression;
create policy "progression : la mienne" on public.progression
  for all to authenticated
  using (profil_id = (select auth.uid()))
  with check (profil_id = (select auth.uid()));

-- ── commentaires ─────────────────────────────────────────────────────
drop policy if exists "commentaires : lecture si leçon visible" on public.commentaires;
create policy "commentaires : lecture si leçon visible" on public.commentaires
  for select to authenticated
  using (not masque and public.lecon_visible(lecon_id));

drop policy if exists "commentaires : j'écris les miens" on public.commentaires;
create policy "commentaires : j'écris les miens" on public.commentaires
  for insert to authenticated
  with check (profil_id = (select auth.uid()) and public.lecon_visible(lecon_id));

drop policy if exists "commentaires : je modifie les miens" on public.commentaires;
create policy "commentaires : je modifie les miens" on public.commentaires
  for update to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin())
  with check (profil_id = (select auth.uid()) or public.est_admin());

drop policy if exists "commentaires : je supprime les miens" on public.commentaires;
create policy "commentaires : je supprime les miens" on public.commentaires
  for delete to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());

-- ── TP ───────────────────────────────────────────────────────────────
drop policy if exists "tps : lecture si module visible" on public.tps;
create policy "tps : lecture si module visible" on public.tps
  for select to authenticated
  using (public.est_admin() or (publie and public.module_visible(module_id)));

drop policy if exists "tps : admin écrit" on public.tps;
create policy "tps : admin écrit" on public.tps
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- Les corrigés : admin uniquement, en lecture comme en écriture.
-- Aucune règle n'est posée pour les autres, donc personne d'autre ne
-- voit une seule ligne.
drop policy if exists "corriges : admin seulement" on public.corriges;
create policy "corriges : admin seulement" on public.corriges
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── copies ───────────────────────────────────────────────────────────
drop policy if exists "copies : je lis la mienne" on public.copies;
create policy "copies : je lis la mienne" on public.copies
  for select to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());

drop policy if exists "copies : je dépose la mienne" on public.copies;
create policy "copies : je dépose la mienne" on public.copies
  for insert to authenticated
  with check (profil_id = (select auth.uid()));

drop policy if exists "copies : je remplace la mienne" on public.copies;
create policy "copies : je remplace la mienne" on public.copies
  for update to authenticated
  using (profil_id = (select auth.uid()))
  with check (profil_id = (select auth.uid()));

-- ── attributions ─────────────────────────────────────────────────────
drop policy if exists "attributions : les miennes" on public.attributions;
create policy "attributions : les miennes" on public.attributions
  for select to authenticated
  using (correcteur_id = (select auth.uid()) or public.est_admin());

-- ── corrections ──────────────────────────────────────────────────────
-- Je vois celles que j'ai données. Je vois celles reçues sur ma copie
-- uniquement si j'ai moi-même rendu mes trois corrections.
drop policy if exists "corrections : les miennes, et les reçues si verrou levé" on public.corrections;
create policy "corrections : les miennes, et les reçues si verrou levé" on public.corrections
  for select to authenticated
  using (
    correcteur_id = (select auth.uid())
    or public.est_admin()
    or exists (
      select 1 from public.copies co
      where co.id = corrections.copie_id
        and co.profil_id = (select auth.uid())
        and public.verrou_leve(co.tp_id)
    )
  );

drop policy if exists "corrections : je corrige ce qui m'est attribué" on public.corrections;
create policy "corrections : je corrige ce qui m'est attribué" on public.corrections
  for insert to authenticated
  with check (
    correcteur_id = (select auth.uid())
    and exists (
      select 1 from public.attributions a
      where a.id = corrections.attribution_id
        and a.correcteur_id = (select auth.uid())
        and a.copie_id = corrections.copie_id
    )
    -- Jamais sa propre copie.
    and not exists (
      select 1 from public.copies co
      where co.id = corrections.copie_id and co.profil_id = (select auth.uid())
    )
  );

-- ── achats ───────────────────────────────────────────────────────────
-- Écriture par le service role uniquement (le point d'entrée Chariow).
drop policy if exists "achats : je lis les miens" on public.achats;
create policy "achats : je lis les miens" on public.achats
  for select to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());

-- ── certificats ──────────────────────────────────────────────────────
-- La page publique de vérification passera par le service role, pas ici.
drop policy if exists "certificats : je lis les miens" on public.certificats;
create policy "certificats : je lis les miens" on public.certificats
  for select to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());

-- ─────────────────────────────────────────────────────────────────────
--  9. STOCKAGE
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values
  ('ressources', 'ressources', true),   -- fichiers de départ, publics
  ('depots',     'depots',     false),  -- copies des apprenants
  ('corriges',   'corriges',   false)   -- corrigés : admin seulement
on conflict (id) do nothing;

-- Dépôts : chaque personne n'écrit et ne lit que dans son propre dossier,
-- nommé par son identifiant. `depots/<uid>/<tp>/<fichier>.xlsx`
drop policy if exists "depots : mon dossier en lecture" on storage.objects;
create policy "depots : mon dossier en lecture" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'depots'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.est_admin())
  );

drop policy if exists "depots : mon dossier en écriture" on storage.objects;
create policy "depots : mon dossier en écriture" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'depots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "depots : je remplace mon fichier" on storage.objects;
create policy "depots : je remplace mon fichier" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'depots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Ressources : tout le monde lit, admin écrit.
drop policy if exists "ressources : admin dépose" on storage.objects;
create policy "ressources : admin dépose" on storage.objects
  for all to authenticated
  using (bucket_id = 'ressources' and public.est_admin())
  with check (bucket_id = 'ressources' and public.est_admin());

-- Corrigés : admin, et personne d'autre.
drop policy if exists "corriges : admin seulement" on storage.objects;
create policy "corriges : admin seulement" on storage.objects
  for all to authenticated
  using (bucket_id = 'corriges' and public.est_admin())
  with check (bucket_id = 'corriges' and public.est_admin());
