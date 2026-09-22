-- ═══════════════════════════════════════════════════════════════════
--  Les questions que personne n'a encore reprises
--
--  Avec 218 apprenants et onze modules, une question se perd vite. Et
--  une question ignorée fait plus de dégâts qu'une question mal
--  répondue : elle apprend à ne plus en poser.
--
--  Réservée à l'instructeur. La fonction le vérifie elle-même plutôt
--  que de s'en remettre à la page qui l'appelle.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.questions_en_attente(p_limite int default 50)
returns table (
  id          uuid,
  corps       text,
  cree_le     timestamptz,
  heures      int,
  auteur      text,
  module_num  int,
  lecon_num   int,
  lecon_titre text,
  a_image     boolean
)
language sql stable security definer set search_path = ''
as $$
  select
    c.id, c.corps, c.cree_le,
    floor(extract(epoch from (now() - c.cree_le)) / 3600)::int,
    coalesce(nullif(btrim(p.nom), ''), 'Participant'),
    m.numero, l.numero, l.titre,
    (c.image is not null)
  from public.commentaires c
  join public.profils p on p.id = c.profil_id
  join public.lecons  l on l.id = c.lecon_id
  join public.modules m on m.id = l.module_id
  where public.est_admin()
    and c.parent_id is null
    and not c.masque
    and not exists (
      select 1 from public.commentaires r
      where r.parent_id = c.id and not r.masque
    )
  order by c.cree_le
  limit greatest(1, least(p_limite, 200));
$$;

grant execute on function public.questions_en_attente(int) to authenticated;
