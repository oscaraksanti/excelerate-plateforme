-- ═══════════════════════════════════════════════════════════════════
--  « Utile », et la réponse qui résout
--
--  Deux ajouts au fil, tous deux au service de la trentième personne
--  qui arrivera avec la même question.
--
--  « Utile » plutôt que « j'aime » : un j'aime mesure la sympathie,
--  « utile » dit « ça a répondu à ma question ». C'est le second
--  signal qui sert à quelqu'un qui cherche.
--
--  La réponse acceptée transforme un fil en réponse. Elle est désignée
--  par l'auteur de la question — c'est lui qui sait si son problème est
--  réglé — ou par l'instructeur.
-- ═══════════════════════════════════════════════════════════════════

-- ── La réponse qui résout ───────────────────────────────────────────
--  Portée par le message d'ouverture, et pointant vers l'une de ses
--  réponses. `on delete set null` : si la réponse est supprimée, le
--  fil redevient simplement ouvert.
alter table public.commentaires
  add column if not exists reponse_acceptee uuid
    references public.commentaires(id) on delete set null;

comment on column public.commentaires.reponse_acceptee is
  'Sur un message d''ouverture : la réponse qui a résolu la question.';

-- ── Les votes « utile » ─────────────────────────────────────────────
create table if not exists public.votes_utiles (
  commentaire_id uuid not null references public.commentaires(id) on delete cascade,
  profil_id      uuid not null references public.profils(id) on delete cascade,
  cree_le        timestamptz not null default now(),
  primary key (commentaire_id, profil_id)
);

alter table public.votes_utiles enable row level security;

--  Personne n'a besoin de savoir QUI a trouvé un message utile : on ne
--  laisse lire que ses propres votes, et c'est la fonction du fil qui
--  compte les autres.
drop policy if exists "votes : je lis les miens" on public.votes_utiles;
create policy "votes : je lis les miens" on public.votes_utiles
  for select to authenticated
  using (profil_id = (select auth.uid()) or public.est_admin());

drop policy if exists "votes : je vote pour moi" on public.votes_utiles;
create policy "votes : je vote pour moi" on public.votes_utiles
  for insert to authenticated
  with check (
    profil_id = (select auth.uid())
    and exists (
      select 1 from public.commentaires c
      where c.id = commentaire_id
        and not c.masque
        and public.lecon_visible(c.lecon_id)
    )
  );

drop policy if exists "votes : je retire le mien" on public.votes_utiles;
create policy "votes : je retire le mien" on public.votes_utiles
  for delete to authenticated
  using (profil_id = (select auth.uid()));

create index if not exists votes_utiles_commentaire on public.votes_utiles(commentaire_id);

-- ── Le fil, enrichi ─────────────────────────────────────────────────
--  PostgreSQL refuse de changer le type de retour d'une fonction
--  existante : on la retire d'abord. Rien ne s'y rattache — elle n'est
--  appelée que depuis le code, jamais depuis une vue ou une règle.
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
  je_peux_resoudre  boolean
)
language sql stable security definer set search_path = ''
as $$
  select
    c.id, c.parent_id, c.corps, c.cree_le, c.profil_id,
    --  Prénom et initiale : « Aïcha Mbala » devient « Aïcha M. ».
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
    --  Cette réponse-ci est-elle celle qui a résolu son fil ?
    (c.parent_id is not null and exists (
      select 1 from public.commentaires racine
      where racine.id = c.parent_id and racine.reponse_acceptee = c.id
    )),
    --  Qui peut désigner la bonne réponse : l'auteur de la question,
    --  et l'instructeur.
    (c.profil_id = (select auth.uid()) or public.est_admin())
  from public.commentaires c
  join public.profils p on p.id = c.profil_id
  where c.lecon_id = p_lecon
    and not c.masque
    and public.lecon_visible(p_lecon)
  order by c.cree_le;
$$;

grant execute on function public.fil_commentaires(uuid) to authenticated;
