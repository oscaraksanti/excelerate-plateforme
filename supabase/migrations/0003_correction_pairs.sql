-- ══════════════════════════════════════════════════════════════════════
--  La correction entre pairs
--
--  Quatre mécanismes, et ils se tiennent entre eux :
--   1. on ne voit sa note qu'après avoir corrigé N copies
--   2. trois correcteurs par copie, médiane et non moyenne
--   3. anonymat des deux côtés
--   4. une copie témoin, déjà notée, glissée dans la file de chacun
--
--  Tout est porté par la base, jamais par l'interface : quelqu'un qui
--  interroge l'API directement ne peut pas contourner la règle.
-- ══════════════════════════════════════════════════════════════════════

-- ── Nouvelles colonnes ───────────────────────────────────────────────

alter table public.profils
  add column if not exists poids_correcteur numeric(4,2) not null default 1.0;

comment on column public.profils.poids_correcteur is
  'Baisse tout seul quand la copie témoin est notée très loin de la vérité. Jamais modifiable depuis l''interface.';

alter table public.copies
  add column if not exists est_temoin boolean not null default false,
  add column if not exists note_temoin numeric(5,2);

comment on column public.copies.est_temoin is
  'Copie de calibrage, notée par Oscar, glissée dans la file de chacun.';

create index if not exists idx_copies_temoin on public.copies(tp_id) where est_temoin;

-- ── Les cinq critères par défaut ─────────────────────────────────────
-- Volontairement centrés sur ce qu'un programme ne peut pas juger.
-- Modifiables TP par TP depuis l'administration.

create or replace function public.criteres_par_defaut()
returns jsonb language sql immutable
as $$
  select '[
    {"cle":"structure","titre":"La structure du classeur",
     "aide":"Tableaux structurés, plages nommées, feuilles séparées. Le fichier tient-il encore si on ajoute deux mille lignes ?"},
    {"cle":"methode","titre":"La justesse de la méthode",
     "aide":"La fonction employée est-elle la bonne pour le problème, ou un détour qui tombe juste par chance ?"},
    {"cle":"lisibilite","titre":"La lisibilité des formules",
     "aide":"Des noms explicites, des formules qu''on relit sans effort. Une formule juste mais illisible reste un problème."},
    {"cle":"presentation","titre":"La présentation du résultat",
     "aide":"Comprend-on ce que dit le classeur en dix secondes, sans explication ?"},
    {"cle":"robustesse","titre":"La robustesse",
     "aide":"Que se passe-t-il si une donnée manque, si un nombre est stocké en texte, si on ajoute une ligne ?"}
  ]'::jsonb;
$$;

update public.tps
set criteres = public.criteres_par_defaut()
where criteres is null or jsonb_array_length(criteres) = 0;

-- ── Le poids d'une correction est posé par la base ───────────────────
-- Il vient du profil du correcteur, jamais de ce que le navigateur envoie.

create or replace function public.avant_correction()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  new.poids := coalesce(
    (select p.poids_correcteur from public.profils p where p.id = new.correcteur_id),
    1.0
  );
  return new;
end;
$$;

drop trigger if exists sur_avant_correction on public.corrections;
create trigger sur_avant_correction
  before insert on public.corrections
  for each row execute function public.avant_correction();

-- ── Recalcul de la note d'une copie ──────────────────────────────────
-- Médiane et non moyenne : un correcteur extrême ne déplace rien.
-- Deux corrections au minimum, sinon un avis isolé ferait la note.

create or replace function public.recalculer_copie(p_copie uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_pairs   numeric;
  v_nb      int;
  v_machine numeric;
begin
  select count(*), percentile_cont(0.5) within group (order by c.total)
    into v_nb, v_pairs
  from public.corrections c
  where c.copie_id = p_copie and c.poids >= 0.5;

  if v_nb < 2 then
    v_pairs := null;
  end if;

  select note_machine into v_machine from public.copies where id = p_copie;

  update public.copies
  set note_pairs = round(v_pairs, 2),
      note_finale = case
        when v_pairs is null   then null
        when v_machine is null then round(v_pairs, 2)
        -- 60 % machine, 40 % pairs
        else round(0.6 * v_machine + 0.4 * v_pairs, 2)
      end
  where id = p_copie;
end;
$$;

-- ── Après une correction ─────────────────────────────────────────────

create or replace function public.apres_correction()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_temoin boolean;
  v_ref    numeric;
begin
  update public.attributions
    set statut = 'faite'
    where id = new.attribution_id;

  select c.est_temoin, c.note_temoin into v_temoin, v_ref
  from public.copies c where c.id = new.copie_id;

  if coalesce(v_temoin, false) and v_ref is not null then
    -- Calibrage : noter la copie témoin très loin de la vérité fait
    -- baisser le poids du correcteur, silencieusement.
    if abs(new.total - v_ref) > 5 then
      update public.profils
        set poids_correcteur = greatest(0.30, poids_correcteur - 0.35)
        where id = new.correcteur_id;
      update public.corrections set poids = 0.40 where id = new.id;
    end if;
  else
    perform public.recalculer_copie(new.copie_id);
  end if;

  return new;
end;
$$;

drop trigger if exists sur_apres_correction on public.corrections;
create trigger sur_apres_correction
  after insert on public.corrections
  for each row execute function public.apres_correction();

-- ── L'attribution des copies ─────────────────────────────────────────
-- Les copies les moins corrigées d'abord, jamais la sienne, jamais deux
-- fois la même. La copie témoin passe en premier.

create or replace function public.attribuer_copies(p_tp uuid)
returns int language plpgsql security definer set search_path = ''
as $$
declare
  v_moi      uuid := (select auth.uid());
  v_requis   int;
  v_manquant int;
  v_pose     int := 0;
  v_ajoute   int;
begin
  if v_moi is null then return 0; end if;

  select t.corrections_requises into v_requis
  from public.tps t where t.id = p_tp and t.publie;
  if v_requis is null then return 0; end if;

  -- Il faut avoir déposé sa propre copie pour entrer dans la file.
  if not exists (
    select 1 from public.copies c
    where c.tp_id = p_tp and c.profil_id = v_moi
  ) then
    return -1;
  end if;

  select v_requis - count(*) into v_manquant
  from public.attributions a
  join public.copies c on c.id = a.copie_id
  where a.correcteur_id = v_moi and c.tp_id = p_tp and a.statut <> 'expiree';

  if v_manquant <= 0 then return 0; end if;

  -- 1. La copie témoin, si elle existe et n'est pas déjà attribuée.
  insert into public.attributions (copie_id, correcteur_id, est_temoin)
  select c.id, v_moi, true
  from public.copies c
  where c.tp_id = p_tp
    and c.est_temoin
    and not exists (
      select 1 from public.attributions a
      where a.copie_id = c.id and a.correcteur_id = v_moi
    )
  limit 1
  on conflict do nothing;

  get diagnostics v_ajoute = row_count;
  v_pose := v_pose + v_ajoute;
  v_manquant := v_manquant - v_ajoute;

  -- 2. Les copies les moins corrigées, au hasard à égalité.
  if v_manquant > 0 then
    insert into public.attributions (copie_id, correcteur_id)
    select c.id, v_moi
    from public.copies c
    left join (
      select copie_id, count(*) as n
      from public.corrections group by copie_id
    ) k on k.copie_id = c.id
    where c.tp_id = p_tp
      and not c.est_temoin
      and c.profil_id <> v_moi
      and not exists (
        select 1 from public.attributions a
        where a.copie_id = c.id and a.correcteur_id = v_moi
      )
    order by coalesce(k.n, 0) asc, random()
    limit v_manquant
    on conflict do nothing;

    get diagnostics v_ajoute = row_count;
    v_pose := v_pose + v_ajoute;
  end if;

  return v_pose;
end;
$$;

-- ── Ce que le correcteur a le droit de voir ──────────────────────────
-- Surtout pas la table `copies` : elle porte l'identité de l'auteur et
-- sa note machine. On ne rend que le strict nécessaire, anonymement.

create or replace function public.ma_file(p_tp uuid)
returns table (
  attribution_id uuid,
  copie_id       uuid,
  depose_le      timestamptz,
  statut         text,
  est_temoin     boolean
)
language sql stable security definer set search_path = ''
as $$
  select a.id, c.id, c.depose_le, a.statut, a.est_temoin
  from public.attributions a
  join public.copies c on c.id = a.copie_id
  where a.correcteur_id = (select auth.uid())
    and c.tp_id = p_tp
    and a.statut <> 'expiree'
  order by a.statut desc, a.attribue_le;
$$;

/** Combien de corrections ai-je rendues, et combien m'en reste-t-il ? */
create or replace function public.mon_avancement(p_tp uuid)
returns table (faites int, requises int, attribuees int)
language sql stable security definer set search_path = ''
as $$
  select
    public.corrections_faites(p_tp, (select auth.uid())),
    coalesce((select t.corrections_requises from public.tps t where t.id = p_tp), 3),
    (select count(*)::int
       from public.attributions a
       join public.copies c on c.id = a.copie_id
      where a.correcteur_id = (select auth.uid())
        and c.tp_id = p_tp and a.statut = 'en_attente');
$$;

-- ── Droits d'exécution ───────────────────────────────────────────────

grant execute on function public.attribuer_copies(uuid) to authenticated;
grant execute on function public.ma_file(uuid)          to authenticated;
grant execute on function public.mon_avancement(uuid)   to authenticated;
grant execute on function public.verrou_leve(uuid)      to authenticated;
grant execute on function public.criteres_par_defaut()  to authenticated;
