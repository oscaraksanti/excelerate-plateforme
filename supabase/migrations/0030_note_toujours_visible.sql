-- ═══════════════════════════════════════════════════════════════════
--  Une note finale existe toujours
--
--  Jordan a rendu son TP 2, corrigé les trois copies demandées, et sa
--  page lui répondait « —/20 ». Il avait fait sa part ; c'est le
--  nombre de pairs revenus sur SA copie qui manquait, et ça ne dépend
--  pas de lui.
--
--  La règle des deux correcteurs reste : une médiane à un seul avis
--  n'est pas une médiane, et un correcteur sévère ferait la note.
--  Mais elle ne peut pas servir d'excuse pour ne rien afficher.
--
--  Donc : tant que deux pairs ne sont pas passés, la note finale est
--  la note machine seule, et elle est dite PROVISOIRE. Dès le
--  deuxième correcteur, la médiane entre, la pondération du TP
--  s'applique, et la note devient DÉFINITIVE.
--
--  Une note provisoire peut bouger, dans les deux sens. C'est le prix
--  de l'honnêteté, et c'est préférable à un tiret.
-- ═══════════════════════════════════════════════════════════════════

alter table public.copies
  add column if not exists note_definitive boolean not null default false;

comment on column public.copies.note_definitive is
  'Vrai quand au moins deux corrections de pairs sont entrées dans la '
  'médiane. Faux : la note finale ne vaut que la machine, en attendant.';

create or replace function public.recalculer_copie(p_copie uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_pairs   numeric;
  v_nb      int;
  v_machine numeric;
  v_poids   numeric;
begin
  select count(*), percentile_cont(0.5) within group (order by c.total)
    into v_nb, v_pairs
  from public.corrections c
  where c.copie_id = p_copie and c.poids >= 0.5;

  select c.note_machine, coalesce(t.poids_machine, 0.60)
    into v_machine, v_poids
  from public.copies c
  join public.tps t on t.id = c.tp_id
  where c.id = p_copie;

  if v_nb < 2 then
    --  Pas encore de médiane : la machine porte la note, seule et
    --  provisoirement.
    update public.copies
    set note_pairs      = null,
        note_finale     = v_machine,
        note_definitive = false
    where id = p_copie;
    return;
  end if;

  update public.copies
  set note_pairs      = round(v_pairs, 2),
      note_finale     = case
        when v_machine is null then round(v_pairs, 2)
        else round(v_poids * v_machine + (1 - v_poids) * v_pairs, 2)
      end,
      note_definitive = true
  where id = p_copie;
end;
$$;

-- ── La note machine, elle aussi, doit atterrir ───────────────────────
--  Jusqu'ici seule une correction de pair déclenchait le calcul. Une
--  copie que personne n'a encore lue n'avait donc pas de note finale,
--  même quand la machine l'avait notée.

create or replace function public.apres_note_machine()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform public.recalculer_copie(new.id);
  return null;
end;
$$;

drop trigger if exists sur_note_machine on public.copies;
create trigger sur_note_machine
  after insert or update of note_machine on public.copies
  for each row
  when (new.note_machine is not null)
  execute function public.apres_note_machine();

-- ── Reprise de l'existant ────────────────────────────────────────────

do $$
declare c record;
begin
  for c in select id from public.copies loop
    perform public.recalculer_copie(c.id);
  end loop;
end;
$$;
