-- ══════════════════════════════════════════════════════════════════════
--  Les inscrits importés
--
--  On ne crée pas 2 000 comptes d'authentification : ce serait deux
--  mille appels, plusieurs minutes, et pour rien. Les inscrits attendent
--  ici ; le compte se crée à la première connexion, et le nom comme le
--  téléphone s'y posent tout seuls.
-- ══════════════════════════════════════════════════════════════════════

create table if not exists public.inscrits (
  email      text primary key,
  nom        text not null default '',
  telephone  text,
  source     text not null default 'import',
  lot        text,
  importe_le timestamptz not null default now()
);

create index if not exists idx_inscrits_lot on public.inscrits(lot);

alter table public.inscrits enable row level security;

drop policy if exists "inscrits : admin seulement" on public.inscrits;
create policy "inscrits : admin seulement" on public.inscrits
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── La création de profil pioche dans les inscrits ───────────────────
create or replace function public.creer_profil()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_nom text;
  v_tel text;
begin
  select i.nom, i.telephone into v_nom, v_tel
  from public.inscrits i where lower(i.email) = lower(new.email);

  insert into public.profils (id, email, nom, telephone, role, origine)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nom', ''), v_nom, ''),
    coalesce(new.raw_user_meta_data ->> 'telephone', v_tel),
    case
      when lower(new.email) in ('oscaraksanti@gmail.com', 'formations4data@gmail.com')
      then 'admin' else 'apprenant'
    end,
    case when v_nom is not null then 'import' else 'inscription' end
  )
  on conflict (id) do nothing;

  perform public.rattacher_achats(new.id, new.email);
  return new;
end;
$$;

-- ── Les métriques comptent maintenant les inscrits ───────────────────
create or replace function public.metriques()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case when not public.est_admin() then '{}'::jsonb else jsonb_build_object(
    'inscrits',        (select count(*) from public.inscrits),
    'comptes',         (select count(*) from public.profils),
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

-- ── Les segments, pour alimenter systeme.io ──────────────────────────
-- La plateforme n'envoie pas d'emails de masse : elle sort des listes.
create or replace function public.segment(p_nom text)
returns table (email text, nom text, telephone text)
language sql stable security definer set search_path = ''
as $$
  select s.email, s.nom, s.telephone from (
    -- Tous les inscrits importés
    select i.email, i.nom, i.telephone from public.inscrits i
    where p_nom = 'tous' and public.est_admin()

    union all
    -- Ceux qui ont ouvert un compte
    select p.email, p.nom, p.telephone from public.profils p
    where p_nom = 'connectes' and public.est_admin() and p.email is not null

    union all
    -- Inscrits qui ne se sont jamais connectés
    select i.email, i.nom, i.telephone from public.inscrits i
    where p_nom = 'jamais_connectes' and public.est_admin()
      and not exists (select 1 from public.profils p where lower(p.email) = lower(i.email))

    union all
    -- Ont déposé au moins une copie
    select p.email, p.nom, p.telephone from public.profils p
    where p_nom = 'ont_rendu' and public.est_admin() and p.email is not null
      and exists (select 1 from public.copies c where c.profil_id = p.id and not c.est_temoin)

    union all
    -- Ont un compte mais n'ont rien rendu
    select p.email, p.nom, p.telephone from public.profils p
    where p_nom = 'rien_rendu' and public.est_admin() and p.email is not null
      and not exists (select 1 from public.copies c where c.profil_id = p.id and not c.est_temoin)

    union all
    -- Ont terminé leurs corrections sur au moins un TP
    select distinct p.email, p.nom, p.telephone from public.profils p
    join public.corrections k on k.correcteur_id = p.id
    where p_nom = 'ont_corrige' and public.est_admin() and p.email is not null

    union all
    -- Acheteurs
    select p.email, p.nom, p.telephone from public.profils p
    where p_nom = 'acheteurs' and public.est_admin() and p.email is not null
      and exists (select 1 from public.achats a where a.profil_id = p.id)

    union all
    -- Non-acheteurs : la cible des relances du 24 au 27
    select i.email, i.nom, i.telephone from public.inscrits i
    where p_nom = 'non_acheteurs' and public.est_admin()
      and not exists (
        select 1 from public.achats a where lower(a.email) = lower(i.email)
      )
  ) s
  order by s.nom nulls last, s.email;
$$;

grant execute on function public.segment(text) to authenticated;
