-- ══════════════════════════════════════════════════════════════════════
--  Contrôle fin : accès par leçon, programmation, réglages du direct
-- ══════════════════════════════════════════════════════════════════════

-- ── La leçon porte désormais son propre accès ────────────────────────
alter table public.lecons
  add column if not exists acces text not null default 'herite'
    check (acces in ('herite','libre','payant')),
  add column if not exists publie_le timestamptz,
  add column if not exists accroche text not null default '';

comment on column public.lecons.acces is
  '« herite » suit le module. « libre » ou « payant » passe outre, leçon par leçon.';
comment on column public.lecons.publie_le is
  'Mise en ligne automatique à cette date. Vide = visible dès que publie est coché.';
comment on column public.lecons.accroche is
  'Ce qu''on lit sous une leçon verrouillée. C''est un argument de vente, pas une note technique.';

-- ── Les réglages pilotés depuis l'administration ─────────────────────
create table if not exists public.reglages (
  cle    text primary key,
  valeur jsonb not null,
  maj_le timestamptz not null default now()
);

insert into public.reglages (cle, valeur) values
  ('direct', '{"actif":false,"titre":"Soirée 1 — Arrêter de se battre avec ses données","lien":"","debut_le":null,"duree_min":120}'::jsonb)
on conflict (cle) do nothing;

alter table public.reglages enable row level security;

drop policy if exists "reglages : tout le monde lit" on public.reglages;
create policy "reglages : tout le monde lit" on public.reglages
  for select to authenticated using (true);

drop policy if exists "reglages : admin écrit" on public.reglages;
create policy "reglages : admin écrit" on public.reglages
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── Une leçon est-elle réellement ouvrable ? ─────────────────────────
create or replace function public.lecon_ouvrable(p_lecon uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.lecons l
    join public.modules m on m.id = l.module_id
    where l.id = p_lecon
      and (
        public.est_admin()
        or (
          m.publie
          and l.publie
          and (l.publie_le is null or l.publie_le <= now())
          and (
            case coalesce(nullif(l.acces,'herite'), m.acces)
              when 'libre'   then true
              when 'gratuit' then true
              else public.a_acces_paye()
            end
          )
        )
      )
  );
$$;

-- On remplace l'ancienne : elle ne connaissait que le module.
create or replace function public.lecon_visible(p_lecon uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select public.lecon_ouvrable(p_lecon); $$;

-- ── Le sommaire d'un module ──────────────────────────────────────────
-- Il liste TOUTES les leçons publiées, y compris celles qu'on ne peut
-- pas ouvrir. Voir sept leçons cadenassées fait plus pour la vente que
-- n'importe quel argument — mais le contenu, lui, ne sort jamais.
create or replace function public.sommaire_module(p_module uuid)
returns table (
  id          uuid,
  numero      int,
  titre       text,
  duree_min   int,
  accroche    text,
  a_video     boolean,
  verrouille  boolean,
  raison      text,
  publie_le   timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select
    l.id, l.numero, l.titre, l.duree_min, l.accroche,
    (l.video_id is not null),
    not public.lecon_ouvrable(l.id),
    case
      when public.est_admin() then null
      when not l.publie then 'brouillon'
      when l.publie_le is not null and l.publie_le > now() then 'programmee'
      when coalesce(nullif(l.acces,'herite'), m.acces) in ('payant','paye')
           and not public.a_acces_paye() then 'payant'
      else null
    end,
    l.publie_le
  from public.lecons l
  join public.modules m on m.id = l.module_id
  where l.module_id = p_module
    and (public.est_admin() or (m.publie and l.publie))
  order by l.numero;
$$;

-- ── Les modules se voient tous, même les payants ─────────────────────
drop policy if exists "modules : lecture selon accès" on public.modules;
create policy "modules : lecture selon accès" on public.modules
  for select to authenticated
  using (publie or public.est_admin());

-- ── Les leçons ne se lisent en entier que si elles sont ouvrables ────
drop policy if exists "lecons : lecture selon accès" on public.lecons;
create policy "lecons : lecture selon accès" on public.lecons
  for select to authenticated
  using (public.lecon_ouvrable(id));

-- ── Les chiffres du tableau de bord, en une requête ──────────────────
create or replace function public.metriques()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case when not public.est_admin() then '{}'::jsonb else jsonb_build_object(
    'inscrits',        (select count(*) from public.profils),
    'importes',        (select count(*) from public.profils where origine = 'import'),
    'connectes',       (select count(*) from auth.users where last_sign_in_at is not null),
    'actifs_7j',       (select count(distinct profil_id) from public.progression where vue_le > now() - interval '7 days'),
    'lecons_vues',     (select count(*) from public.progression),
    'lecons_finies',   (select count(*) from public.progression where terminee),
    'copies',          (select count(*) from public.copies where not est_temoin),
    'corrections',     (select count(*) from public.corrections),
    'commentaires',    (select count(*) from public.commentaires),
    'ventes',          (select count(*) from public.achats),
    'ca_brut',         (select coalesce(sum(montant),0) from public.achats),
    'certificats',     (select count(*) from public.certificats where revoque_le is null),
    'modules_publies', (select count(*) from public.modules where publie),
    'lecons_publiees', (select count(*) from public.lecons where publie)
  ) end;
$$;

-- ── Qui est qui : la liste des apprenants, avec leur engagement ──────
create or replace function public.apprenants(p_recherche text default null, p_limite int default 200)
returns table (
  id            uuid,
  email         text,
  nom           text,
  telephone     text,
  role          text,
  origine       text,
  cree_le       timestamptz,
  lecons_vues   int,
  copies        int,
  corrections   int,
  a_paye        boolean
)
language sql stable security definer set search_path = ''
as $$
  select
    p.id, p.email, p.nom, p.telephone, p.role, p.origine, p.cree_le,
    (select count(*)::int from public.progression g where g.profil_id = p.id),
    (select count(*)::int from public.copies c where c.profil_id = p.id and not c.est_temoin),
    (select count(*)::int from public.corrections k where k.correcteur_id = p.id),
    exists (select 1 from public.achats a where a.profil_id = p.id)
  from public.profils p
  where public.est_admin()
    and (
      p_recherche is null or p_recherche = ''
      or p.email ilike '%' || p_recherche || '%'
      or p.nom ilike '%' || p_recherche || '%'
      or p.telephone ilike '%' || p_recherche || '%'
    )
  order by p.cree_le desc
  limit greatest(1, least(p_limite, 5000));
$$;

grant execute on function public.lecon_ouvrable(uuid)      to authenticated;
grant execute on function public.sommaire_module(uuid)     to authenticated;
grant execute on function public.metriques()               to authenticated;
grant execute on function public.apprenants(text, int)     to authenticated;
