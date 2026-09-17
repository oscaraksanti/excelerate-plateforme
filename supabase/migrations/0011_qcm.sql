-- ══════════════════════════════════════════════════════════════════════
--  Le QCM — six questions par module.
--
--  Il existe pour une raison precise : le direct est a 19 h GMT et une
--  grande partie de la promotion le regarde en replay, le lendemain, sur
--  un telephone. Sur un telephone on n'ouvre pas Excel, on ne fait pas un
--  TP. Le QCM est la seule activite possible — et rester engage entre le
--  lundi et le mercredi est ce qui predit le mieux l'achat.
--
--  Ce n'est donc pas un examen : correction immediate, essais illimites,
--  aucun seuil bloquant. Le TP reste la seule porte du certificat.
-- ══════════════════════════════════════════════════════════════════════

create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  numero       int  not null,
  genre        text not null default 'concept'
    check (genre in ('concept','pepite','diagnostic','outil','verif_ia','piege')),
  enonce       text not null,
  -- [{"cle":"a","texte":"..."}, ...] — l'ordre d'affichage est celui du tableau
  propositions jsonb not null default '[]'::jsonb,
  publie       boolean not null default false,
  cree_le      timestamptz not null default now(),
  unique (module_id, numero)
);

-- La bonne reponse vit dans SA PROPRE table, comme les corriges de TP.
-- Aucun « select * » maladroit, aujourd'hui ou dans six mois, ne peut
-- donc reveler la reponse avant que la personne ait repondu.
create table if not exists public.questions_cle (
  question_id uuid primary key references public.questions(id) on delete cascade,
  bonne       text not null,
  explication text not null default ''
);

create table if not exists public.reponses_qcm (
  profil_id     uuid not null references public.profils(id) on delete cascade,
  question_id   uuid not null references public.questions(id) on delete cascade,
  -- Le premier essai est le seul qui dise quelque chose : c'est lui qui
  -- sert aux statistiques. Les suivants servent a apprendre.
  premier_choix text not null,
  premier_juste boolean not null,
  dernier_choix text not null,
  essais        int  not null default 1,
  repondu_le    timestamptz not null default now(),
  primary key (profil_id, question_id)
);

create index if not exists questions_module_idx on public.questions(module_id, numero);
create index if not exists reponses_qcm_question_idx on public.reponses_qcm(question_id);

alter table public.questions     enable row level security;
alter table public.questions_cle enable row level security;
alter table public.reponses_qcm  enable row level security;

-- ── Les enonces : lisibles si le module l'est ───────────────────────
drop policy if exists "questions lisibles" on public.questions;
create policy "questions lisibles" on public.questions
  for select to authenticated
  using (publie and public.module_visible(module_id));

drop policy if exists "questions admin" on public.questions;
create policy "questions admin" on public.questions
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── Les cles : personne, sauf l'administrateur ──────────────────────
drop policy if exists "cles admin" on public.questions_cle;
create policy "cles admin" on public.questions_cle
  for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- ── Mes reponses : les miennes, et rien d'autre ─────────────────────
drop policy if exists "mes reponses qcm" on public.reponses_qcm;
create policy "mes reponses qcm" on public.reponses_qcm
  for select to authenticated
  using (profil_id = auth.uid() or public.est_admin());

-- L'ecriture passe uniquement par repondre_qcm() : le navigateur ne
-- decide jamais lui-meme si une reponse est juste.

-- ══════════════════════════════════════════════════════════════════════
--  Repondre
-- ══════════════════════════════════════════════════════════════════════
create or replace function public.repondre_qcm(p_question uuid, p_choix text)
returns table (juste boolean, bonne text, explication text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_module   uuid;
  v_publie   boolean;
  v_bonne    text;
  v_expl     text;
  v_juste    boolean;
  v_existe   boolean;
begin
  if auth.uid() is null then
    raise exception 'connexion requise';
  end if;

  select q.module_id, q.publie into v_module, v_publie
  from public.questions q where q.id = p_question;

  if v_module is null or not v_publie or not public.module_visible(v_module) then
    raise exception 'question indisponible';
  end if;

  select k.bonne, k.explication into v_bonne, v_expl
  from public.questions_cle k where k.question_id = p_question;

  if v_bonne is null then
    raise exception 'question sans corrige';
  end if;

  v_juste := (lower(trim(p_choix)) = lower(trim(v_bonne)));

  select true into v_existe from public.reponses_qcm r
  where r.profil_id = auth.uid() and r.question_id = p_question;

  if v_existe then
    update public.reponses_qcm r
       set dernier_choix = p_choix,
           essais        = r.essais + 1,
           repondu_le    = now()
     where r.profil_id = auth.uid() and r.question_id = p_question;
  else
    insert into public.reponses_qcm
      (profil_id, question_id, premier_choix, premier_juste, dernier_choix)
    values (auth.uid(), p_question, p_choix, v_juste, p_choix);
  end if;

  return query select v_juste, v_bonne, v_expl;
end;
$$;

-- ══════════════════════════════════════════════════════════════════════
--  Le QCM d'un module, tel que je le vois
--
--  La bonne reponse et l'explication ne sortent QUE si j'ai deja repondu.
--  Repondre au hasard les revele : c'est voulu, il n'y a pas de note.
-- ══════════════════════════════════════════════════════════════════════
create or replace function public.mon_qcm(p_module uuid)
returns table (
  id            uuid,
  numero        int,
  genre         text,
  enonce        text,
  propositions  jsonb,
  mon_choix     text,
  deja_repondu  boolean,
  bonne         text,
  explication   text
)
language sql security definer set search_path = ''
as $$
  select
    q.id, q.numero, q.genre, q.enonce, q.propositions,
    r.dernier_choix,
    r.profil_id is not null,
    case when r.profil_id is not null then k.bonne end,
    case when r.profil_id is not null then k.explication end
  from public.questions q
  left join public.questions_cle k on k.question_id = q.id
  left join public.reponses_qcm  r on r.question_id = q.id and r.profil_id = auth.uid()
  where q.module_id = p_module
    and q.publie
    and public.module_visible(p_module)
    and auth.uid() is not null
  order by q.numero;
$$;

-- ══════════════════════════════════════════════════════════════════════
--  Les statistiques, pour l'administrateur
--
--  Une question ratee par plus de 60 % n'est pas forcement difficile :
--  c'est souvent une lecon mal expliquee. Elle se regarde avant 19 h.
-- ══════════════════════════════════════════════════════════════════════
create or replace function public.stats_qcm()
returns table (
  module_numero int,
  question_id   uuid,
  numero        int,
  genre         text,
  enonce        text,
  reponses      bigint,
  reussite      numeric
)
language sql security definer set search_path = ''
as $$
  select
    m.numero, q.id, q.numero, q.genre, q.enonce,
    count(r.profil_id),
    case when count(r.profil_id) = 0 then null
         else round(100.0 * count(*) filter (where r.premier_juste)
                    / count(r.profil_id), 0)
    end
  from public.questions q
  join public.modules m on m.id = q.module_id
  left join public.reponses_qcm r on r.question_id = q.id
  where public.est_admin()
  group by m.numero, q.id, q.numero, q.genre, q.enonce
  order by m.numero, q.numero;
$$;

grant execute on function public.repondre_qcm(uuid, text) to authenticated;
grant execute on function public.mon_qcm(uuid)             to authenticated;
grant execute on function public.stats_qcm()               to authenticated;

comment on table public.questions_cle is
  'La bonne reponse, separee de l''enonce : aucun select sur questions ne peut la reveler.';
