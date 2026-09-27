-- ═══════════════════════════════════════════════════════════════════
--  Deux modules lisibles sans compte
--
--  Aujourd'hui, Google ne voit qu'une seule page : l'accueil. Cinquante
--  -cinq leçons écrites, testées et relues sont derrière un compte, et
--  n'existent donc pour personne qui cherche « tableau structuré
--  Excel » ou « RECHERCHEX ».
--
--  Les modules 0 et 1 s'ouvrent. Pas les quatre gratuits : ceux-là
--  restent la récompense de l'inscription. Deux suffisent pour exister
--  dans les résultats de recherche, et ce sont ceux qui répondent aux
--  questions les plus cherchées.
--
--  Le niveau « libre » existait dans le schéma sans jamais servir. Il
--  prend enfin son sens : « libre » = lisible même déconnecté.
-- ═══════════════════════════════════════════════════════════════════

update public.lecons l
set acces = 'libre'
from public.modules m
where m.id = l.module_id
  and m.numero in (0, 1)
  and l.publie
  and m.publie
  and l.acces <> 'libre';

-- ── Ce que voit quelqu'un qui n'a pas de compte ──────────────────────
--  Deux fonctions, et non deux sous-requêtes croisées : une politique
--  sur `lecons` qui interroge `modules` pendant qu'une politique sur
--  `modules` interroge `lecons` tourne en rond, et Postgres refuse.
--  En `security definer`, la lecture se fait hors des politiques.

create or replace function public.lecon_libre(p_lecon uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.lecons l
    join public.modules m on m.id = l.module_id
    where l.id = p_lecon
      and l.publie and m.publie
      and l.acces = 'libre'
      and (l.publie_le is null or l.publie_le <= now())
      and (m.publie_le is null or m.publie_le <= now())
  );
$$;

comment on function public.lecon_libre(uuid) is
  'Lisible sans compte. Volontairement plus étroit que lecon_ouvrable : '
  '« gratuit » demande un compte, « libre » n''en demande pas.';

create or replace function public.module_libre(p_module uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.lecons l
    join public.modules m on m.id = l.module_id
    where m.id = p_module
      and l.publie and m.publie and l.acces = 'libre'
      and (m.publie_le is null or m.publie_le <= now())
  );
$$;

--  Des politiques séparées, pour le rôle anonyme seulement. Celles des
--  personnes connectées ne bougent pas : on n'a pas touché au verrou,
--  on a ouvert une porte à côté, plus étroite.

drop policy if exists "lecons : le public lit les libres" on public.lecons;
create policy "lecons : le public lit les libres" on public.lecons
  for select to anon
  using (public.lecon_libre(id));

drop policy if exists "modules : le public lit ceux qui ont du libre" on public.modules;
create policy "modules : le public lit ceux qui ont du libre" on public.modules
  for select to anon
  using (public.module_libre(id));

--  Les ressources d'une leçon libre le sont aussi : un classeur de
--  départ sans son énoncé ne sert à rien, et l'inverse non plus.
drop policy if exists "ressources : le public lit celles des leçons libres" on public.ressources;
create policy "ressources : le public lit celles des leçons libres" on public.ressources
  for select to anon
  using (public.lecon_libre(lecon_id));

grant execute on function public.lecon_libre(uuid)  to anon, authenticated;
grant execute on function public.module_libre(uuid) to anon, authenticated;
