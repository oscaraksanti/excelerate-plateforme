-- ══════════════════════════════════════════════════════════════════════
--  La grille de correction entre pairs passe à six critères.
--
--  Les cinq précédents mélangeaient la forme et le fond. Ceux-ci
--  reprennent la grille du plan de contenu : chaque critère se vérifie
--  objectivement, sans que l'évaluateur ait à juger. Et le sixième —
--  l'usage critique de l'IA — est ce que ce programme évalue et que
--  personne d'autre n'évalue.
-- ══════════════════════════════════════════════════════════════════════

create or replace function public.criteres_par_defaut()
returns jsonb language sql immutable
as $$
  select '[
    {"cle":"exactitude","titre":"L''exactitude des résultats",
     "aide":"Les valeurs attendues sont dans l''énoncé. Compare-les, ne les juge pas. Les deux cellules de contrôle valent-elles zéro ?"},
    {"cle":"methode","titre":"La méthode Excel",
     "aide":"Au moins un tableau structuré nommé ? Les plages nommées demandées existent-elles ? Reste-t-il une valeur écrite en dur dans une formule ?"},
    {"cle":"donnees","titre":"La qualité des données",
     "aide":"La feuille QUALITE est-elle remplie, avec ses statuts PASS / WARNING / FAIL ? Les quantités stockées en texte ont-elles été réparées ?"},
    {"cle":"presentation","titre":"La présentation et la lisibilité",
     "aide":"Formats corrects, devise affichée, feuilles nommées. Comprend-on ce que dit le classeur en dix secondes, sans explication ?"},
    {"cle":"reproductibilite","titre":"La reproductibilité",
     "aide":"La feuille README dit-elle d''où viennent les données, quelles hypothèses ont été prises, et comment actualiser le mois prochain ?"},
    {"cle":"ia","titre":"L''usage critique de l''IA",
     "aide":"La feuille ANNEXE_IA contient-elle le prompt exact, ce que l''IA a rendu, AU MOINS UNE erreur détectée, et quel V du protocole l''a attrapée ? « J''ai utilisé l''IA » ne vaut rien."}
  ]'::jsonb;
$$;

-- Les TP qui portaient encore l'ancienne grille et qu'aucune copie
-- n'a encore évalués basculent sur la nouvelle.
update public.tps t
   set criteres = public.criteres_par_defaut()
 where not exists (
   select 1 from public.corrections c
   join public.attributions a on a.id = c.attribution_id
   join public.copies co on co.id = a.copie_id
   where co.tp_id = t.id
 );
