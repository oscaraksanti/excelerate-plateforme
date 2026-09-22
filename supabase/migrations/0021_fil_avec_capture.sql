-- ═══════════════════════════════════════════════════════════════════
--  Le fil signale ses captures
--
--  On ne sort pas le chemin du fichier : l'image se demande par
--  l'identifiant du message, à /api/captures, qui refait le contrôle
--  d'accès. Un booléen suffit donc ici — et un chemin qui ne circule
--  pas est un chemin qui ne fuit pas.
-- ═══════════════════════════════════════════════════════════════════

drop function if exists public.fil_commentaires(uuid);

create function public.fil_commentaires(p_lecon uuid)
returns table (
  id                uuid,
  parent_id         uuid,
  corps             text,
  cree_le           timestamptz,
  profil_id         uuid,
  auteur            text,
  est_instructeur   boolean,
  est_moi           boolean,
  utiles            int,
  moi_utile         boolean,
  reponse_acceptee  uuid,
  est_acceptee      boolean,
  je_peux_resoudre  boolean,
  a_image           boolean
)
language sql stable security definer set search_path = ''
as $$
  select
    c.id, c.parent_id, c.corps, c.cree_le, c.profil_id,
    case
      when btrim(coalesce(p.nom, '')) = '' then 'Participant'
      when position(' ' in btrim(p.nom)) = 0 then btrim(p.nom)
      else split_part(btrim(p.nom), ' ', 1) || ' '
           || upper(left(split_part(btrim(p.nom), ' ', 2), 1)) || '.'
    end,
    (p.role = 'admin'),
    (c.profil_id = (select auth.uid())),
    (select count(*)::int from public.votes_utiles v where v.commentaire_id = c.id),
    exists (
      select 1 from public.votes_utiles v
      where v.commentaire_id = c.id and v.profil_id = (select auth.uid())
    ),
    c.reponse_acceptee,
    (c.parent_id is not null and exists (
      select 1 from public.commentaires racine
      where racine.id = c.parent_id and racine.reponse_acceptee = c.id
    )),
    (c.profil_id = (select auth.uid()) or public.est_admin()),
    (c.image is not null)
  from public.commentaires c
  join public.profils p on p.id = c.profil_id
  where c.lecon_id = p_lecon
    and not c.masque
    and public.lecon_visible(p_lecon)
  order by c.cree_le;
$$;

grant execute on function public.fil_commentaires(uuid) to authenticated;
