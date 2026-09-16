-- ══════════════════════════════════════════════════════════════════════
--  Réparation des numéros abîmés à l'import
--
--  Le normaliseur supposait la RDC par défaut et préfixait « +243 » à
--  tout numéro qui ne commençait ni par « + », ni par « 0 ». Or une
--  bonne moitié de la liste arrivait déjà en international sans le
--  « + » : Côte d'Ivoire, Cameroun, Sénégal, Bénin, Tchad, Togo,
--  Burkina, Guinée. Ces numéros se sont retrouvés avec un « 243 » de
--  trop devant leur propre indicatif.
--
--  Un abonné congolais tient en neuf chiffres. Tout ce qui porte
--  « +243 » suivi d'autre chose que neuf chiffres a donc été mal formé,
--  et le « 243 » excédentaire se retire sans ambiguïté.
-- ══════════════════════════════════════════════════════════════════════

update public.inscrits
set telephone = '+' || substring(replace(telephone, '+', '') from 4)
where telephone like '+243%'
  and length(replace(telephone, '+', '')) <> 12
  and length(replace(telephone, '+', '')) > 12
  -- Le reste doit rester un numéro plausible une fois le 243 retiré.
  and length(substring(replace(telephone, '+', '') from 4)) between 8 and 15;

update public.profils
set telephone = '+' || substring(replace(telephone, '+', '') from 4)
where telephone like '+243%'
  and length(replace(telephone, '+', '')) <> 12
  and length(replace(telephone, '+', '')) > 12
  and length(substring(replace(telephone, '+', '') from 4)) between 8 and 15;
