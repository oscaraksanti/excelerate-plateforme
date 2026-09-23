-- ═══════════════════════════════════════════════════════════════════
--  Aucune copie ne doit rester sans lecteur
--
--  Ce que les données du 24 septembre disent, TP 1 :
--
--    OUSMANE, déposé le 21 à 21 h 32 → 4 correcteurs
--    Arlette,  déposé le 22 à 11 h 56 → 4 correcteurs
--    stone,    déposé le 23 à 01 h 24 → 2 correcteurs
--    Yolo,     déposé le 23 à 16 h 24 → 0 correcteur
--    Guidrie,  déposé le 23 à 17 h 33 → 0 correcteur
--
--  Ce n'est pas du retard, c'est une impasse : les copies n'entraient
--  dans une file QUE si quelqu'un cliquait « corriger », et tous ceux
--  qui avaient cliqué avaient déjà leurs trois copies. Plus tu déposes
--  tard, moins tu as de chances d'être lu — et Guidrie a payé 37 $.
--
--  Trois corrections, donc :
--
--  1. RÉPARTIR quand une copie arrive, au lieu d'attendre qu'on la
--     réclame. Une copie déposée entre tout de suite dans les files
--     de ceux qui ont encore de la place.
--
--  2. LIBÉRER ce qui dort. Deux personnes gardaient six copies en
--     attente depuis plus d'un jour sans les corriger. Une copie
--     réservée et jamais lue vaut moins qu'une copie libre.
--
--  3. COMPTER LES RÉSERVATIONS, pas seulement les corrections
--     rendues, au moment de choisir « la copie la moins corrigée ».
--     Sans ça on empilait quatre lecteurs sur la même.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Libérer les copies réservées et jamais lues ───────────────────

create or replace function public.liberer_attributions(
  p_tp uuid,
  p_heures int default 48
)
returns int language plpgsql security definer set search_path = ''
as $$
declare v_n int;
begin
  update public.attributions a
  set statut = 'expiree'
  from public.copies c
  where c.id = a.copie_id
    and c.tp_id = p_tp
    and a.statut = 'en_attente'
    and a.attribue_le < now() - make_interval(hours => greatest(1, p_heures));

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

comment on function public.liberer_attributions(uuid, int) is
  'Une copie réservée depuis plus de N heures et jamais corrigée '
  'retourne au pot commun. Libère aussi le quota du correcteur.';

-- ── 2. Répartir : la copie va chercher ses lecteurs ──────────────────

create or replace function public.repartir_copies(p_tp uuid)
returns int language plpgsql security definer set search_path = ''
as $$
declare
  v_requis     int;
  v_pose       int := 0;
  v_copie      uuid;
  v_auteur     uuid;
  v_manque     int;
  v_correcteur uuid;
  v_i          int;
begin
  select t.corrections_requises into v_requis
  from public.tps t where t.id = p_tp and t.publie;
  if v_requis is null then return 0; end if;

  perform public.liberer_attributions(p_tp);

  --  Deux lecteurs par copie : c'est le minimum pour une médiane.
  --  Les plus démunies d'abord, puis les plus anciennes.
  for v_copie, v_auteur, v_manque in
    select c.id, c.profil_id,
           2 - (select count(*)::int from public.attributions a
                 where a.copie_id = c.id and a.statut <> 'expiree')
    from public.copies c
    where c.tp_id = p_tp
      and not c.est_temoin
      and (select count(*) from public.attributions a
            where a.copie_id = c.id and a.statut <> 'expiree') < 2
    order by (select count(*) from public.attributions a
               where a.copie_id = c.id and a.statut <> 'expiree') asc,
             c.depose_le asc
  loop
    for v_i in 1 .. v_manque loop
      --  Un correcteur de ce TP qui a encore de la place, le moins
      --  chargé d'abord.
      select p.id into v_correcteur
      from public.copies mienne
      join public.profils p on p.id = mienne.profil_id
      where mienne.tp_id = p_tp
        and not mienne.est_temoin
        and p.id <> v_auteur
        and not exists (
          select 1 from public.attributions a
          where a.copie_id = v_copie and a.correcteur_id = p.id
        )
        and (select count(*) from public.attributions a
             join public.copies cc on cc.id = a.copie_id
             where a.correcteur_id = p.id and cc.tp_id = p_tp
               and a.statut <> 'expiree') < v_requis
      order by (select count(*) from public.attributions a
                join public.copies cc on cc.id = a.copie_id
                where a.correcteur_id = p.id and cc.tp_id = p_tp
                  and a.statut <> 'expiree') asc,
               random()
      limit 1;

      exit when v_correcteur is null;

      insert into public.attributions (copie_id, correcteur_id)
      values (v_copie, v_correcteur)
      on conflict do nothing;
      v_pose := v_pose + 1;
    end loop;
  end loop;

  return v_pose;
end;
$$;

comment on function public.repartir_copies(uuid) is
  'Place les copies mal loties dans les files de ceux qui ont encore '
  'de la place. Appelée au dépôt, et depuis l''administration.';

-- ── 3. La file qu'on réclame : compter aussi les réservations ────────

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

  if not exists (
    select 1 from public.copies c
    where c.tp_id = p_tp and c.profil_id = v_moi
  ) then
    return -1;
  end if;

  --  Avant de servir : rendre au pot ce qui dort depuis deux jours.
  perform public.liberer_attributions(p_tp);

  select v_requis - count(*) into v_manquant
  from public.attributions a
  join public.copies c on c.id = a.copie_id
  where a.correcteur_id = v_moi and c.tp_id = p_tp and a.statut <> 'expiree';

  if v_manquant <= 0 then return 0; end if;

  --  1. La copie témoin, si elle existe et n'est pas déjà attribuée.
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

  --  2. Les copies les moins servies. On compte les lecteurs déjà
  --     posés dessus — rendus ET réservés. L'ancienne version ne
  --     comptait que les corrections rendues, et redonnait donc la
  --     même copie à un quatrième lecteur pendant que d'autres
  --     n'en avaient aucun.
  if v_manquant > 0 then
    insert into public.attributions (copie_id, correcteur_id)
    select c.id, v_moi
    from public.copies c
    where c.tp_id = p_tp
      and not c.est_temoin
      and c.profil_id <> v_moi
      and not exists (
        select 1 from public.attributions a
        where a.copie_id = c.id and a.correcteur_id = v_moi
      )
    order by (select count(*) from public.attributions a
               where a.copie_id = c.id and a.statut <> 'expiree') asc,
             c.depose_le asc,
             random()
    limit v_manquant
    on conflict do nothing;

    get diagnostics v_ajoute = row_count;
    v_pose := v_pose + v_ajoute;
  end if;

  return v_pose;
end;
$$;

-- ── 4. Corriger une copie de plus, volontairement ────────────────────
--  Quand tout le monde a rendu ses trois corrections et qu'il reste
--  des copies sans deuxième lecteur, le quota devient le problème.
--  On peut alors en prendre une de plus — jusqu'à trois au-delà du dû.

create or replace function public.copies_en_souffrance(p_tp uuid)
returns int language sql stable security definer set search_path = ''
as $$
  select count(*)::int
  from public.copies c
  where c.tp_id = p_tp
    and not c.est_temoin
    and c.profil_id <> (select auth.uid())
    and (select count(*) from public.corrections k
          where k.copie_id = c.id and k.poids >= 0.5) < 2
    and not exists (
      select 1 from public.attributions a
      where a.copie_id = c.id and a.correcteur_id = (select auth.uid())
    );
$$;

comment on function public.copies_en_souffrance(uuid) is
  'Combien de copies attendent encore un deuxième lecteur et pourraient '
  'm''être confiées. Sert à proposer une correction de plus.';

create or replace function public.attribuer_une_de_plus(p_tp uuid)
returns int language plpgsql security definer set search_path = ''
as $$
declare
  v_moi    uuid := (select auth.uid());
  v_requis int;
  v_a_moi  int;
  v_pose   int;
begin
  if v_moi is null then return 0; end if;

  select t.corrections_requises into v_requis
  from public.tps t where t.id = p_tp and t.publie;
  if v_requis is null then return 0; end if;

  --  Il faut avoir déposé sa copie, et avoir fait sa part.
  if not public.est_admin() then
    if not exists (
      select 1 from public.copies c
      where c.tp_id = p_tp and c.profil_id = v_moi
    ) then
      return -1;
    end if;
    if public.corrections_faites(p_tp, v_moi) < v_requis then
      return -2;
    end if;
  end if;

  --  Trois de plus au maximum : on aide, on ne prend pas le contrôle
  --  des notes du groupe.
  select count(*) into v_a_moi
  from public.attributions a
  join public.copies c on c.id = a.copie_id
  where a.correcteur_id = v_moi and c.tp_id = p_tp and a.statut <> 'expiree';

  if v_a_moi >= v_requis + 3 then return -3; end if;

  insert into public.attributions (copie_id, correcteur_id)
  select c.id, v_moi
  from public.copies c
  where c.tp_id = p_tp
    and not c.est_temoin
    and c.profil_id <> v_moi
    and (select count(*) from public.corrections k
          where k.copie_id = c.id and k.poids >= 0.5) < 2
    and not exists (
      select 1 from public.attributions a
      where a.copie_id = c.id and a.correcteur_id = v_moi
    )
  order by (select count(*) from public.attributions a
             where a.copie_id = c.id and a.statut <> 'expiree') asc,
           c.depose_le asc
  limit 1
  on conflict do nothing;

  get diagnostics v_pose = row_count;
  return v_pose;
end;
$$;

-- ── 5. Ce qu'Oscar doit pouvoir voir ─────────────────────────────────

create or replace function public.etat_corrections()
returns table (
  tp_id        uuid,
  module       int,
  tp           text,
  copie_id     uuid,
  profil_id    uuid,
  nom          text,
  email        text,
  a_paye       boolean,
  depose_le    timestamptz,
  recues       int,
  reservees    int,
  dormantes    int,
  note_finale  numeric,
  definitive   boolean,
  ses_faites   int,
  ses_dues     int
)
language sql stable security definer set search_path = ''
as $$
  select
    t.id, m.numero, t.titre, c.id, p.id, p.nom, p.email,
    exists (select 1 from public.achats a where a.profil_id = p.id),
    c.depose_le,
    (select count(*)::int from public.corrections k
      where k.copie_id = c.id and k.poids >= 0.5),
    (select count(*)::int from public.attributions a
      where a.copie_id = c.id and a.statut = 'en_attente'),
    (select count(*)::int from public.attributions a
      where a.copie_id = c.id and a.statut = 'en_attente'
        and a.attribue_le < now() - interval '48 hours'),
    c.note_finale,
    c.note_definitive,
    public.corrections_faites(t.id, p.id),
    t.corrections_requises
  from public.copies c
  join public.tps t on t.id = c.tp_id
  join public.modules m on m.id = t.module_id
  join public.profils p on p.id = c.profil_id
  where public.est_admin() and not c.est_temoin
  order by m.numero, t.numero, c.depose_le;
$$;

grant execute on function public.liberer_attributions(uuid, int) to authenticated;
grant execute on function public.repartir_copies(uuid)           to authenticated;
grant execute on function public.copies_en_souffrance(uuid)      to authenticated;
grant execute on function public.attribuer_une_de_plus(uuid)     to authenticated;
grant execute on function public.etat_corrections()              to authenticated;

-- ── 6. Ce que l'auteur peut savoir de sa propre copie ────────────────
--  Sans trahir personne : combien l'ont lue, combien l'ont réservée.
--  Une page qui dit « il manque une lecture » sans dire si quelqu'un
--  est dessus laisse croire à l'abandon.

create or replace function public.etat_de_ma_copie(p_tp uuid)
returns table (recues int, en_lecture int, definitive boolean)
language sql stable security definer set search_path = ''
as $$
  select
    (select count(*)::int from public.corrections k
      where k.copie_id = c.id and k.poids >= 0.5),
    (select count(*)::int from public.attributions a
      where a.copie_id = c.id and a.statut = 'en_attente'),
    c.note_definitive
  from public.copies c
  where c.tp_id = p_tp and c.profil_id = (select auth.uid());
$$;

grant execute on function public.etat_de_ma_copie(uuid) to authenticated;
