-- ═══════════════════════════════════════════════════════════════════
--  Le cercle change de nature
--
--  Il était vendu comme « quatre séances de groupe, une par semaine à
--  partir du 28 septembre ». Ce sera désormais un appel en tête à
--  tête, quand l'acheteur veut. Trois endroits disaient l'ancienne
--  version — la page publique, cette fiche, et le courriel de
--  confirmation. Les trois changent ensemble : une promesse qui
--  survit à un seul endroit finit toujours par être opposée au
--  vendeur.
-- ═══════════════════════════════════════════════════════════════════

update public.produits
set accroche = 'La masterclass, plus un appel en tête à tête avec Oscar.',
    detail   = 'Tout ce que contient la masterclass, et en plus : un appel personnel de '
             || 'trente minutes avec Oscar, sur vos propres fichiers — pas sur un cas '
             || 'd''école. Vous réservez votre créneau quand vous voulez. Plus un canal '
             || 'privé où il répond.'
where ref = 'prd_xzmmvl07';
