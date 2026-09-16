-- ══════════════════════════════════════════════════════════════════════
--  Qui a déposé sa copie mais n'a pas fini ses corrections
--
--  C'est la seule relance que systeme.io ne peut pas écrire : elle
--  dépend de ce que la personne a fait ici.
-- ══════════════════════════════════════════════════════════════════════

create or replace function public.a_relancer()
returns table (profil_id uuid, email text, nom text, restant int)
language sql stable security definer set search_path = ''
as $$
  with du as (
    select
      c.profil_id,
      sum(t.corrections_requises)::int                                  as requis,
      sum(public.corrections_faites(t.id, c.profil_id))::int            as faites
    from public.copies c
    join public.tps t on t.id = c.tp_id
    join public.modules m on m.id = t.module_id
    where not c.est_temoin and t.publie and m.publie
    group by c.profil_id
  )
  select p.id, p.email, p.nom, (du.requis - du.faites)
  from du
  join public.profils p on p.id = du.profil_id
  where public.est_admin()
    and du.requis > du.faites
    and p.email is not null
  order by (du.requis - du.faites) desc, p.nom;
$$;

grant execute on function public.a_relancer() to authenticated;
