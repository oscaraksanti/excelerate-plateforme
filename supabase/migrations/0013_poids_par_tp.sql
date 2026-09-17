-- ══════════════════════════════════════════════════════════════════════
--  Le poids de la machine devient un réglage du TP
--
--  Jusqu'ici, la note finale valait partout 60 % machine + 40 % pairs.
--  Ça convient à un TP de calcul : la machine sait vérifier une formule
--  et une valeur.
--
--  Le TP du module 6 livre un tableau de bord. La machine y note la
--  couche de calcul — les douze indicateurs, les contrôles, les plages
--  nommées — et elle ne saura jamais dire si la page se lit en huit
--  secondes. Là, ce sont les pairs qui doivent peser le plus.
--
--  Par défaut, rien ne change : 0,60. Le module 6 descend à 0,40.
-- ══════════════════════════════════════════════════════════════════════

alter table public.tps
  add column if not exists poids_machine numeric(3,2) not null default 0.60;

alter table public.tps
  drop constraint if exists tps_poids_machine_borne;
alter table public.tps
  add constraint tps_poids_machine_borne
  check (poids_machine >= 0 and poids_machine <= 1);

comment on column public.tps.poids_machine is
  'Part de la note automatique dans la note finale. Le complément revient '
  'à la médiane des corrections entre pairs. 0,60 par défaut ; 0,40 pour '
  'un TP dont le livrable se juge à l''œil.';

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

  if v_nb < 2 then
    v_pairs := null;
  end if;

  select c.note_machine, coalesce(t.poids_machine, 0.60)
    into v_machine, v_poids
  from public.copies c
  join public.tps t on t.id = c.tp_id
  where c.id = p_copie;

  update public.copies
  set note_pairs = round(v_pairs, 2),
      note_finale = case
        when v_pairs is null   then null
        when v_machine is null then round(v_pairs, 2)
        else round(v_poids * v_machine + (1 - v_poids) * v_pairs, 2)
      end
  where id = p_copie;
end;
$$;
