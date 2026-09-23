-- ═══════════════════════════════════════════════════════════════════
--  Le nom qui figurera sur le certificat
--
--  À l'inscription, beaucoup n'ont tapé qu'un prénom — « KOUAME »,
--  « Ben237 » — et un compte est même resté sans nom du tout. Un
--  certificat ne peut pas être établi sur ça.
--
--  Or la personne a donné son identité une deuxième fois, au moment
--  de payer, et là elle l'a donnée en entier : Chariow nous la
--  transmet dans la notification, et nous la conservons intégralement
--  dans `achats.charge_utile`.
--
--  On s'en sert — mais seulement pour compléter, jamais pour écraser :
--  un nom déjà complet est celui que la personne a choisi d'afficher,
--  et il ne nous appartient pas.
-- ═══════════════════════════════════════════════════════════════════

--  La même règle que côté application (`nomComplet` dans formats.ts) :
--  au moins quatre caractères, au moins deux mots.
create or replace function public.nom_complet(p_nom text)
returns boolean
language sql immutable
as $$
  select length(propre) >= 4
     and coalesce(array_length(string_to_array(propre, ' '), 1), 0) >= 2
  from (select btrim(regexp_replace(coalesce(p_nom, ''), '\s+', ' ', 'g')) as propre) x;
$$;

comment on function public.nom_complet(text) is
  'Un nom utilisable sur un certificat : deux mots au moins. Même règle '
  'que nomComplet() côté application.';

--  Le nom porté par le paiement, quelle que soit la forme du payload.
create or replace function public.nom_du_paiement(p_charge jsonb)
returns text
language sql immutable
as $$
  select nullif(btrim(coalesce(
    p_charge -> 'customer' ->> 'name',
    nullif(btrim(concat_ws(' ',
      p_charge -> 'customer' ->> 'first_name',
      p_charge -> 'customer' ->> 'last_name')), '')
  )), '');
$$;

-- ── La reprise : les acheteurs déjà enregistrés ──────────────────────

update public.profils p
set nom = v.nom_paye
from (
  select distinct on (a.profil_id)
    a.profil_id,
    public.nom_du_paiement(a.charge_utile) as nom_paye
  from public.achats a
  where a.profil_id is not null
    and public.nom_complet(public.nom_du_paiement(a.charge_utile))
  order by a.profil_id, a.paye_le desc
) v
where p.id = v.profil_id
  and not public.nom_complet(p.nom);

grant execute on function public.nom_complet(text)      to authenticated;
grant execute on function public.nom_du_paiement(jsonb) to authenticated;
