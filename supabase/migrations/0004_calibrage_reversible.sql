-- ══════════════════════════════════════════════════════════════════════
--  Le calibrage devient réversible.
--
--  Jusqu'ici le poids d'un correcteur ne pouvait que baisser : une
--  mauvaise lecture de la copie témoin au TP 1 pénalisait quelqu'un
--  jusqu'à la fin, même s'il notait juste ensuite. Un système qui ne
--  pardonne pas finit par écarter des gens de bonne foi.
--
--  Désormais : trop loin de la vérité, le poids baisse ; très proche,
--  il remonte. Trois TP suffisent pour revenir à 1,0.
-- ══════════════════════════════════════════════════════════════════════

create or replace function public.apres_correction()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_temoin boolean;
  v_ref    numeric;
  v_ecart  numeric;
begin
  update public.attributions
    set statut = 'faite'
    where id = new.attribution_id;

  select c.est_temoin, c.note_temoin into v_temoin, v_ref
  from public.copies c where c.id = new.copie_id;

  if coalesce(v_temoin, false) and v_ref is not null then
    v_ecart := abs(new.total - v_ref);

    if v_ecart > 5 then
      -- Très loin : le poids baisse et cette correction sort de la médiane.
      update public.profils
        set poids_correcteur = greatest(0.30, poids_correcteur - 0.35)
        where id = new.correcteur_id;
      update public.corrections set poids = 0.40 where id = new.id;

    elsif v_ecart <= 2 then
      -- Très juste : on redonne du crédit, sans jamais dépasser 1,0.
      update public.profils
        set poids_correcteur = least(1.00, poids_correcteur + 0.20)
        where id = new.correcteur_id;
    end if;
    -- Entre 2 et 5 points d'écart : rien. C'est la variation normale
    -- entre deux correcteurs de bonne foi.

  else
    perform public.recalculer_copie(new.copie_id);
  end if;

  return new;
end;
$$;
