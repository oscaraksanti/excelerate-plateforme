-- ═══════════════════════════════════════════════════════════════════
--  Le contrôle des certificats
--
--  Trois choses, et la première est une panne silencieuse.
--
--  1. « Révoquer » ne révoquait rien. La table `certificats` n'a
--     jamais eu de politique d'écriture : la mise à jour partait avec
--     le client de l'utilisateur, touchait zéro ligne, et la page se
--     rafraîchissait comme si tout s'était bien passé. Un certificat
--     qu'on croit retiré et qui reste valide, c'est pire que pas de
--     bouton du tout.
--
--  2. La note d'un certificat AVANCÉ se calculait sur les seuls
--     modules gratuits. Quelqu'un qui a payé et rendu les onze TP
--     aurait reçu un diplôme portant la moyenne de trois d'entre eux.
--
--  3. On ne savait pas si le courriel était parti. Maintenant, si.
-- ═══════════════════════════════════════════════════════════════════

alter table public.certificats
  add column if not exists courriel_le    timestamptz,
  add column if not exists revoque_motif  text;

comment on column public.certificats.courriel_le is
  'Quand l''avis de délivrance est parti. Vide : le certificat existe mais son titulaire ne le sait pas.';
comment on column public.certificats.revoque_motif is
  'Pourquoi. Un retrait sans raison écrite devient inexplicable trois mois plus tard.';

-- ── La politique qui manquait ────────────────────────────────────────

drop policy if exists "certificats : l'administration corrige" on public.certificats;
create policy "certificats : l'administration corrige" on public.certificats
  for update to authenticated
  using (public.est_admin())
  with check (public.est_admin());

-- ── La note doit porter sur ce que le niveau recouvre ────────────────

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

  if p_niveau not in ('fondamentaux', 'avance') then
    raise exception 'niveau inconnu : %', p_niveau;
  end if;

  select code into v_code from public.certificats
   where profil_id = p_profil and revoque_le is null limit 1;
  if v_code is not null then return v_code; end if;

  select nom into v_nom from public.profils where id = p_profil;
  if not public.nom_complet(v_nom) then
    raise exception 'cette personne n''a pas de nom complet : un certificat ne peut pas être établi';
  end if;

  --  Le périmètre du niveau. « avance » couvre tout le programme
  --  publié ; « fondamentaux » les seuls modules gratuits.
  with vises as (
    select t.id
    from public.tps t
    join public.modules m on m.id = t.module_id
    where t.publie and m.publie
      and (p_niveau = 'avance' or m.acces = 'gratuit')
  )
  select
    round(avg(coalesce(c.note_finale, c.note_machine)), 2),
    count(*)::int
  into v_note, v_tps
  from public.copies c
  where c.profil_id = p_profil and c.tp_id in (select id from vises);

  with vises as (
    select t.id
    from public.tps t
    join public.modules m on m.id = t.module_id
    where t.publie and m.publie
      and (p_niveau = 'avance' or m.acces = 'gratuit')
  )
  select count(*)::int into v_cor
  from public.corrections k
  join public.copies c on c.id = k.copie_id
  where k.correcteur_id = p_profil and c.tp_id in (select id from vises);

  v_code := public.code_certificat();

  insert into public.certificats
    (profil_id, code, niveau, nom_affiche, note, mention, corps, tps_rendus, corrections)
  values (
    p_profil, v_code, p_niveau, btrim(regexp_replace(v_nom, '\s+', ' ', 'g')), v_note,
    coalesce(p_mention, case p_niveau
      when 'avance' then 'MS Excel Boosté par l''Intelligence Artificielle'
      else 'Excel + IA — Les fondations' end),
    coalesce(p_corps, ''),
    coalesce(v_tps, 0), coalesce(v_cor, 0)
  );

  return v_code;
end;
$$;

grant execute on function public.delivrer_certificat(uuid, text, text, text) to authenticated;
