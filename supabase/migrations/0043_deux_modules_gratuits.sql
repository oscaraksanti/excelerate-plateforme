-- ═══════════════════════════════════════════════════════════════════
--  Deux modules gratuits, et non plus quatre
--
--  La partie payante commence au module 2. Les modules 0 et 1 restent
--  ouverts — et même lisibles sans compte depuis la migration 0042.
--
--  ── Ce que ça casse, et qu'on répare ──────────────────────────────
--
--  133 personnes sans achat ont déjà ouvert une leçon des modules 2
--  et 3, et HUIT y ont déposé une copie. Fermer sans précaution leur
--  retirerait l'accès à leur propre travail : plus de page de TP,
--  donc plus de note, et surtout plus moyen d'honorer les corrections
--  qui leur sont attribuées — ce qui bloquerait aussi la note de
--  leurs pairs, acheteurs compris.
--
--  On ne reprend donc jamais un module où quelqu'un a déjà déposé.
--  La règle est étroite : personne ne peut la déclencher à l'avenir,
--  puisqu'il faut déjà l'accès pour déposer.
-- ═══════════════════════════════════════════════════════════════════

update public.modules set acces = 'paye' where numero in (2, 3);

-- ── La clause d'antériorité ─────────────────────────────────────────

create or replace function public.deja_engage(p_module uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.copies c
    join public.tps t on t.id = c.tp_id
    where c.profil_id = (select auth.uid())
      and t.module_id = p_module
  );
$$;

comment on function public.deja_engage(uuid) is
  'A déjà rendu un travail dans ce module. On ne retire jamais l''accès '
  'à un module où quelqu''un a déposé : sa note et les corrections qu''il '
  'doit à ses pairs en dépendent.';

create or replace function public.module_visible(p_module uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.modules m
    where m.id = p_module
      and (
        public.est_admin()
        or (
          m.publie
          and (m.publie_le is null or m.publie_le <= now())
          and (
            m.acces = 'gratuit'
            or public.a_acces_paye()
            or public.deja_engage(m.id)
          )
        )
      )
  );
$$;

create or replace function public.lecon_ouvrable(p_lecon uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.lecons l
    join public.modules m on m.id = l.module_id
    where l.id = p_lecon
      and (
        public.est_admin()
        or (
          m.publie
          and l.publie
          and (m.publie_le is null or m.publie_le <= now())
          and (l.publie_le is null or l.publie_le <= now())
          and (
            case coalesce(nullif(l.acces, 'herite'), m.acces)
              when 'libre'   then true
              when 'gratuit' then true
              else public.a_acces_paye() or public.deja_engage(m.id)
            end
          )
        )
      )
  );
$$;

grant execute on function public.deja_engage(uuid) to authenticated;

-- ── Le certificat Fondations suit le périmètre gratuit ──────────────
--  Il se calculait sur « les modules gratuits » : il porterait donc
--  désormais sur un seul travail pratique. L'offre à 27 $ promet la
--  validation des modules 0 à 3 — elle ne correspond plus à rien et
--  doit être retirée de la vente ; en attendant, sa fiche dit la
--  vérité plutôt qu'une promesse qu'on ne tiendrait pas.

update public.produits
set accroche = 'La validation du module 1, sans la suite.',
    detail   = 'Ton certificat vérifiable publiquement, avec ton nom, le travail '
             || 'pratique du module 1 et ta note. Il n''ouvre pas les modules 2 à '
             || '10 : pour ça, c''est la masterclass.'
where ref = 'prd_25rqe6qb';
