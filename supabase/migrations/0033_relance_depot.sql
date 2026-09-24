-- ═══════════════════════════════════════════════════════════════════
--  Qui n'a pas déposé sa copie
--
--  Sur 874 comptes, 862 n'ont jamais rien rendu. Écrire aux 862 serait
--  un envoi de masse — c'est le travail de systeme.io, et ça abîmerait
--  un domaine d'envoi encore jeune.
--
--  On ne garde donc que ceux à qui la phrase « il te reste le TP »
--  veut vraiment dire quelque chose :
--
--    · ceux qui ont TERMINÉ au moins une leçon du module 1 ;
--    · ceux qui ont PAYÉ il y a plus de 24 h, même s'ils n'ont encore
--      rien lu — eux ont acquis un certificat, et un certificat ne
--      s'obtient pas sans travaux rendus. En deçà d'un jour on les
--      laisse tranquilles : ils viennent de payer, ils explorent.
--
--  Le drapeau `a_paye` sépare les deux : ils ne reçoivent pas la même
--  lettre, et ce serait une faute qu'ils la reçoivent.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.a_relancer_depot()
returns table (
  profil_id uuid,
  email     text,
  nom       text,
  finies    int,
  a_paye    boolean
)
language sql stable security definer set search_path = ''
as $$
  with premieres as (
    select l.id
    from public.lecons l
    join public.modules m on m.id = l.module_id
    where m.numero = 1 and l.publie and m.publie
  )
  select
    p.id, p.email, p.nom,
    (select count(*)::int from public.progression g
      where g.profil_id = p.id
        and g.lecon_id in (select id from premieres)
        and g.terminee),
    exists (
      select 1 from public.achats a
      where a.profil_id = p.id and a.paye_le < now() - interval '24 hours'
    )
  from public.profils p
  where public.est_admin()
    and p.role = 'apprenant'
    and p.email is not null
    and not exists (select 1 from public.copies c where c.profil_id = p.id)
    and (
      exists (
        select 1 from public.achats a
        where a.profil_id = p.id and a.paye_le < now() - interval '24 hours'
      )
      or (select count(*) from public.progression g
           where g.profil_id = p.id
             and g.lecon_id in (select id from premieres)
             and g.terminee) >= 1
    )
  order by
    exists (
      select 1 from public.achats a
      where a.profil_id = p.id and a.paye_le < now() - interval '24 hours'
    ) desc,
    p.nom;
$$;

grant execute on function public.a_relancer_depot() to authenticated;
