-- ══════════════════════════════════════════════════════════════════════
--  Les dix modules — 3 gratuits, 7 payants.
--  Tous en brouillon : rien n'est visible tant que tu ne publies pas.
--  Les titres sont modifiables depuis /admin, c'est juste une ossature.
-- ══════════════════════════════════════════════════════════════════════

insert into public.modules (numero, titre, resume, acces, publie) values
  (1,  'Arrêter de se battre avec ses données',
       'Les tableaux structurés, RECHERCHEX, et les trois fonctions qu''Excel 2024 a rendues disponibles sans que personne ne le dise : FILTRE, TRIER, UNIQUE.',
       'gratuit', false),
  (2,  'L''IA comme copilote, pas comme oracle',
       'Faire auditer un fichier existant, structurer une demande pour obtenir une formule juste, et reconnaître les cas où l''IA se trompe avec assurance.',
       'gratuit', false),
  (3,  'Ce qui tourne tout seul',
       'Power Query pour nettoyer une fois pour toutes, LET pour des formules lisibles, et un tableau de bord qui se met à jour sans qu''on y touche.',
       'gratuit', false),
  (4,  'Module 4', '', 'paye', false),
  (5,  'Module 5', '', 'paye', false),
  (6,  'Module 6', '', 'paye', false),
  (7,  'Module 7', '', 'paye', false),
  (8,  'Module 8', '', 'paye', false),
  (9,  'Module 9', '', 'paye', false),
  (10, 'Module 10', '', 'paye', false)
on conflict (numero) do nothing;
