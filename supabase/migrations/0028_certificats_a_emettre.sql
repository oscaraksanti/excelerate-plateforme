-- ═══════════════════════════════════════════════════════════════════
--  Les certificats dus
--
--  « Qui y a droit » liste les 657 apprenants : à cette taille, ça ne
--  se lit plus. Or ceux qu'il ne faut jamais oublier sont ceux qui ont
--  PAYÉ — un certificat acheté et jamais délivré est une promesse
--  rompue, pas un oubli.
--
--  Deux portées, selon ce qui a été acheté :
--    certificat27          → les modules gratuits (Fondations)
--    masterclass, cercle,  → tout le programme (Avancé)
--    équipe
--
--  Une personne peut avoir acheté plusieurs fois : on retient l'offre
--  la plus complète, celle qui décide du certificat dû.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.certificats_a_emettre()
returns table (
  profil_id        uuid,
  email            text,
  nom              text,
  produit          text,
  achete_le        timestamptz,
  niveau_du        text,
  tps_rendus       int,
  tps_total        int,
  corrections      int,
  corrections_dues int,
  moyenne          numeric,
  merite           boolean,
  deja_emis        boolean,
  niveau_emis      text
)
language sql stable security definer set search_path = ''
as $$
  with payeurs as (
    select distinct on (a.profil_id)
      a.profil_id,
      a.produit,
      a.paye_le,
      case when a.produit = 'certificat27' then 'fondamentaux' else 'avance' end as niveau_du
    from public.achats a
    where a.profil_id is not null
    order by
      a.profil_id,
      --  L'offre la plus complète d'abord : c'est elle qui fixe le
      --  certificat dû.
      case a.produit
        when 'equipe'        then 1
        when 'coaching97'    then 2
        when 'masterclass37' then 3
        when 'certificat27'  then 4
        else 5
      end,
      a.paye_le
  )
  select
    p.id, p.email, p.nom, y.produit, y.paye_le, y.niveau_du,
    s.rendus, s.total, s.faites, s.dues, s.moyenne,
    (
      s.total > 0
      and s.rendus >= s.total
      and s.faites >= s.dues
      and coalesce(s.moyenne, 0) >= 12
    ),
    exists (
      select 1 from public.certificats k
      where k.profil_id = p.id and k.revoque_le is null
    ),
    (
      select k.niveau from public.certificats k
      where k.profil_id = p.id and k.revoque_le is null
      order by k.emis_le desc limit 1
    )
  from payeurs y
  join public.profils p on p.id = y.profil_id
  cross join lateral (
    with vises as (
      select t.id, t.corrections_requises
      from public.tps t
      join public.modules m on m.id = t.module_id
      where t.publie and m.publie
        and (y.niveau_du = 'avance' or m.acces = 'gratuit')
    )
    select
      (select count(*)::int from public.copies c
        where c.profil_id = p.id and c.tp_id in (select id from vises)) as rendus,
      (select count(*)::int from vises) as total,
      (select coalesce(sum(public.corrections_faites(g.id, p.id)), 0)::int
        from vises g) as faites,
      (select coalesce(sum(g.corrections_requises), 0)::int from vises g) as dues,
      (select round(avg(coalesce(c.note_finale, c.note_machine)), 2)
        from public.copies c
        where c.profil_id = p.id and c.tp_id in (select id from vises)) as moyenne
  ) s
  where public.est_admin()
  order by y.paye_le;
$$;

grant execute on function public.certificats_a_emettre() to authenticated;
