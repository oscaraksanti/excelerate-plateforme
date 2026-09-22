-- ═══════════════════════════════════════════════════════════════════
--  Le fil de discussion sous une leçon
--
--  Deux choses d'un coup, parce qu'elles ont la même cause.
--
--  1. Les réponses. La colonne `parent_id` existe depuis le socle mais
--     rien ne l'a jamais lue : la requête filtrait `parent_id is null`.
--
--  2. Les noms. La règle « profil : je lis le mien » interdit à un
--     apprenant de lire le profil d'un autre — et elle a raison, cette
--     table porte les adresses et les téléphones. Mais du coup
--     `profils(nom)` revenait vide et TOUT LE MONDE s'affichait
--     « Participant ». Vérifié : 3 commentaires visibles, 0 nom.
--
--  D'où cette fonction : elle franchit la règle une fois, sous
--  contrôle, et ne laisse sortir que le nom d'usage. Ni adresse, ni
--  téléphone, ni rôle brut. La visibilité de la leçon reste le seul
--  droit d'entrée, exactement comme pour la lecture directe.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.fil_commentaires(p_lecon uuid)
returns table (
  id              uuid,
  parent_id       uuid,
  corps           text,
  cree_le         timestamptz,
  profil_id       uuid,
  auteur          text,
  est_instructeur boolean,
  est_moi         boolean
)
language sql stable security definer set search_path = ''
as $$
  select
    c.id, c.parent_id, c.corps, c.cree_le, c.profil_id,
    --  Prénom et initiale : « Aïcha Mbala » devient « Aïcha M. ».
    --  Assez pour qu'une discussion ait des visages, pas assez pour
    --  publier l'identité complète de quelqu'un qui pose une question.
    case
      when btrim(coalesce(p.nom, '')) = '' then 'Participant'
      when position(' ' in btrim(p.nom)) = 0 then btrim(p.nom)
      else split_part(btrim(p.nom), ' ', 1) || ' '
           || upper(left(split_part(btrim(p.nom), ' ', 2), 1)) || '.'
    end,
    (p.role = 'admin'),
    (c.profil_id = (select auth.uid()))
  from public.commentaires c
  join public.profils p on p.id = c.profil_id
  where c.lecon_id = p_lecon
    and not c.masque
    and public.lecon_visible(p_lecon)
  order by c.cree_le;
$$;

grant execute on function public.fil_commentaires(uuid) to authenticated;
