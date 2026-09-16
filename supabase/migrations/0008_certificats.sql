-- ══════════════════════════════════════════════════════════════════════
--  La délivrance des certificats
-- ══════════════════════════════════════════════════════════════════════

alter table public.certificats
  add column if not exists mention    text not null default 'MS Excel Boosté par l''Intelligence Artificielle',
  add column if not exists corps      text not null default '',
  add column if not exists lieu       text not null default 'Kinshasa',
  add column if not exists tps_rendus int  not null default 0,
  add column if not exists corrections int not null default 0;

comment on column public.certificats.mention is
  'Figé à la délivrance : si le libellé change plus tard, les certificats déjà remis gardent le leur.';

-- ── Un code court, lisible à l'oral ──────────────────────────────────
-- Pas de 0/O ni de 1/I : quelqu'un doit pouvoir le dicter au téléphone.
create or replace function public.code_certificat()
returns text language plpgsql volatile security definer set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_code text;
  i int;
begin
  loop
    v_code := '';
    for i in 1..8 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      if i = 4 then v_code := v_code || '-'; end if;
    end loop;
    exit when not exists (select 1 from public.certificats c where c.code = v_code);
  end loop;
  return v_code;
end;
$$;

-- ── Qui y a droit ────────────────────────────────────────────────────
create or replace function public.eligibles_certificat()
returns table (
  profil_id   uuid,
  email       text,
  nom         text,
  tps_rendus  int,
  tps_total   int,
  corrections int,
  corrections_dues int,
  moyenne     numeric,
  a_certificat boolean
)
language sql stable security definer set search_path = ''
as $$
  with gratuits as (
    select t.id, t.corrections_requises
    from public.tps t
    join public.modules m on m.id = t.module_id
    where t.publie and m.publie and m.acces = 'gratuit'
  )
  select
    p.id, p.email, p.nom,
    (select count(*)::int from public.copies c
      where c.profil_id = p.id and c.tp_id in (select id from gratuits)),
    (select count(*)::int from gratuits),
    (select coalesce(sum(public.corrections_faites(g.id, p.id)), 0)::int from gratuits g),
    (select coalesce(sum(g.corrections_requises), 0)::int from gratuits g),
    (select round(avg(coalesce(c.note_finale, c.note_machine)), 2) from public.copies c
      where c.profil_id = p.id and c.tp_id in (select id from gratuits)),
    exists (select 1 from public.certificats k where k.profil_id = p.id and k.revoque_le is null)
  from public.profils p
  where public.est_admin() and p.role = 'apprenant'
  order by p.nom nulls last;
$$;

-- ── La délivrance ────────────────────────────────────────────────────
create or replace function public.delivrer_certificat(
  p_profil uuid,
  p_niveau text default 'fondamentaux',
  p_mention text default null,
  p_corps text default null
)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  v_code text;
  v_nom  text;
  v_note numeric;
  v_tps  int;
  v_cor  int;
begin
  if not public.est_admin() then
    raise exception 'réservé à l''administration';
  end if;

  select code into v_code from public.certificats
   where profil_id = p_profil and revoque_le is null limit 1;
  if v_code is not null then return v_code; end if;

  select nom into v_nom from public.profils where id = p_profil;
  if coalesce(v_nom,'') = '' then
    raise exception 'cette personne n''a pas renseigné son nom';
  end if;

  select
    round(avg(coalesce(c.note_finale, c.note_machine)), 2),
    count(*)::int
  into v_note, v_tps
  from public.copies c
  join public.tps t on t.id = c.tp_id
  join public.modules m on m.id = t.module_id
  where c.profil_id = p_profil and m.acces = 'gratuit';

  select count(*)::int into v_cor
  from public.corrections k where k.correcteur_id = p_profil;

  v_code := public.code_certificat();

  insert into public.certificats
    (profil_id, code, niveau, nom_affiche, note, mention, corps, tps_rendus, corrections)
  values (
    p_profil, v_code, p_niveau, v_nom, v_note,
    coalesce(p_mention, case p_niveau
      when 'avance' then 'MS Excel Boosté par l''Intelligence Artificielle'
      else 'Excel + IA — Les fondations' end),
    coalesce(p_corps, ''),
    coalesce(v_tps, 0), coalesce(v_cor, 0)
  );

  return v_code;
end;
$$;

grant execute on function public.eligibles_certificat()                       to authenticated;
grant execute on function public.delivrer_certificat(uuid, text, text, text)  to authenticated;
