-- ═══════════════════════════════════════════════════════════════════
--  L'ouverture programmée d'un module
--
--  Jusqu'ici un module était ouvert ou fermé, et seule une leçon
--  savait attendre une date. Le lancement demande l'inverse : les
--  modules 1, 2 et 3 sont gratuits et leur sommaire doit se lire dès
--  ce soir — mais leur contenu n'ouvre qu'après le direct de leur
--  journée. Voir ce qui arrive demain fait plus pour l'assiduité que
--  n'importe quelle relance.
--
--  D'où une date d'ouverture portée par le module. Nulle, le module
--  s'ouvre dès qu'il est publié : c'est exactement le comportement
--  d'avant, et toutes les lignes existantes la reçoivent nulle.
-- ═══════════════════════════════════════════════════════════════════

alter table public.modules
  add column if not exists publie_le timestamptz;

comment on column public.modules.publie_le is
  'Date d''ouverture du module. Nulle = ouvert dès la publication. '
  'Dans le futur = le titre et le sommaire se voient, rien ne s''ouvre.';

-- ── Le module n'est visible qu'une fois sa date passée ──────────────
--  Cette fonction garde les TP (0001), les QCM (0011), les ressources
--  et les commentaires. En lui ajoutant la date, on ferme le module
--  entier d'un seul geste, sans avoir à y penser table par table.
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
          and (m.acces = 'gratuit' or public.a_acces_paye())
        )
      )
  );
$$;

-- ── Une leçon ne s'ouvre jamais avant son module ────────────────────
--  lecon_ouvrable refait le raisonnement au lieu d'appeler
--  module_visible — c'est elle qui porte la politique de lecture des
--  leçons (0006), et elle doit donc connaître la date du module.
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
            case coalesce(nullif(l.acces,'herite'), m.acces)
              when 'libre'   then true
              when 'gratuit' then true
              else public.a_acces_paye()
            end
          )
        )
      )
  );
$$;

-- ── Le sommaire annonce la date, et la bonne ────────────────────────
--  greatest() ignore les NULL en PostgreSQL : la date affichée est
--  donc la plus tardive des deux quand les deux existent, la seule
--  qui existe sinon, et NULL quand le module est ouvert.
create or replace function public.sommaire_module(p_module uuid)
returns table (
  id          uuid,
  numero      int,
  titre       text,
  duree_min   int,
  accroche    text,
  a_video     boolean,
  verrouille  boolean,
  raison      text,
  publie_le   timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select
    l.id, l.numero, l.titre, l.duree_min, l.accroche,
    (l.video_id is not null),
    not public.lecon_ouvrable(l.id),
    case
      when public.est_admin() then null
      when not l.publie then 'brouillon'
      when greatest(m.publie_le, l.publie_le) > now() then 'programmee'
      when coalesce(nullif(l.acces,'herite'), m.acces) in ('payant','paye')
           and not public.a_acces_paye() then 'payant'
      else null
    end,
    greatest(m.publie_le, l.publie_le)
  from public.lecons l
  join public.modules m on m.id = l.module_id
  where l.module_id = p_module
    and (public.est_admin() or (m.publie and l.publie))
  order by l.numero;
$$;
