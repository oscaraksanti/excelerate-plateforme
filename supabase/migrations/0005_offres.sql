-- ══════════════════════════════════════════════════════════════════════
--  Le mur d'offres et le déverrouillage
-- ══════════════════════════════════════════════════════════════════════

-- ── Les produits, côté Chariow ───────────────────────────────────────
-- Une table plutôt qu'une variable d'environnement : tu peux activer ou
-- désactiver une offre depuis l'administration, sans redéploiement.
-- Le certificat à 27 $ reste inactif jusqu'au mercredi soir : annoncé
-- lundi, il ancrerait toute l'audience en dessous de la masterclass.

create table if not exists public.produits (
  ref        text primary key,
  produit    text not null check (produit in ('certificat27','masterclass37','coaching97','equipe')),
  titre      text not null,
  accroche   text not null default '',
  detail     text not null default '',
  montant    numeric(10,2),
  lien       text,
  ordre      int not null default 0,
  phare      boolean not null default false,
  actif      boolean not null default false,
  cree_le    timestamptz not null default now()
);

insert into public.produits (ref, produit, titre, accroche, detail, montant, lien, ordre, phare, actif) values
  ('prd_amxzsj81', 'masterclass37', 'La masterclass complète',
   '7 modules de plus, et le certificat avancé inclus.',
   'Power Query en profondeur, tableaux de bord, automatisation, et les cas que tu ne verras pas en trois soirées. Le certificat avancé est compris — tu n''as rien d''autre à prendre.',
   37, 'https://vjiegixw.mychariow.shop/prd_amxzsj81/checkout', 2, true, true),
  ('prd_mdjoug', 'coaching97', 'Accompagnement individuel',
   'Des séances en tête-à-tête avec Oscar.',
   'On travaille sur tes fichiers, tes vrais problèmes, ton métier. Tout est compris : la masterclass, le certificat avancé, et les séances.',
   97, 'https://vjiegixw.mychariow.shop/prd_mdjoug/checkout', 3, false, true),
  ('certificat_27', 'certificat27', 'Le certificat seul',
   'La validation des trois soirées, rien de plus.',
   'Ton certificat vérifiable publiquement, avec ton nom, tes travaux rendus et ta note. Sans les 7 modules.',
   27, null, 1, false, false)
on conflict (ref) do nothing;

alter table public.produits enable row level security;

drop policy if exists "produits : lecture des offres actives" on public.produits;
create policy "produits : lecture des offres actives" on public.produits
  for select to authenticated
  using (actif or public.est_admin());

drop policy if exists "produits : admin écrit" on public.produits;
create policy "produits : admin écrit" on public.produits
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── Rattacher les achats en attente ──────────────────────────────────
-- Quelqu'un peut payer avec une adresse différente de celle de son
-- compte, ou payer avant même d'avoir un compte. L'achat est alors
-- enregistré sans profil, et se rattache dès que l'adresse correspond.

create or replace function public.rattacher_achats(p_profil uuid, p_email text)
returns int language plpgsql security definer set search_path = ''
as $$
declare v_n int;
begin
  update public.achats
     set profil_id = p_profil
   where profil_id is null
     and lower(email) = lower(p_email);
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- Le déclencheur de création de profil rattache maintenant les achats.
create or replace function public.creer_profil()
returns trigger language plpgsql security definer set search_path = ''
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

  -- Un achat payé avant l'ouverture du compte se rattache tout seul.
  perform public.rattacher_achats(new.id, new.email);

  return new;
end;
$$;

-- ── Les trois conditions du certificat ───────────────────────────────

create or replace function public.mes_conditions()
returns table (
  tps_rendus       int,
  tps_total        int,
  corrections      int,
  corrections_dues int,
  moyenne          numeric
)
language sql stable security definer set search_path = ''
as $$
  with
  gratuits as (
    select t.id, t.corrections_requises
    from public.tps t
    join public.modules m on m.id = t.module_id
    where t.publie and m.publie and m.acces = 'gratuit'
  ),
  miennes as (
    select c.tp_id, c.note_finale, c.note_machine
    from public.copies c
    where c.profil_id = (select auth.uid())
      and c.tp_id in (select id from gratuits)
  )
  select
    (select count(*)::int from miennes),
    (select count(*)::int from gratuits),
    (select coalesce(sum(public.corrections_faites(g.id, (select auth.uid()))), 0)::int from gratuits g),
    (select coalesce(sum(g.corrections_requises), 0)::int from gratuits g),
    (select round(avg(coalesce(m.note_finale, m.note_machine)), 2) from miennes m);
$$;

grant execute on function public.mes_conditions()                 to authenticated;
grant execute on function public.rattacher_achats(uuid, text)     to authenticated;
