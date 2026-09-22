-- ═══════════════════════════════════════════════════════════════════
--  Les anciennes références Chariow, toujours vivantes
--
--  Le 22 septembre, quelqu'un a payé par « prd_amxzsj81 » — un produit
--  Chariow antérieur, encore publié, dont le lien continue de circuler
--  dans WhatsApp et les e-mails déjà envoyés. La table ne le
--  connaissait plus : le Pulse serait retombé sur la masterclass par
--  défaut, ce qui était juste par chance.
--
--  On les déclare donc, inactives : elles ne s'affichent nulle part,
--  mais un paiement qui arrive par un vieux lien tombe sur le bon
--  produit, au bon montant.
-- ═══════════════════════════════════════════════════════════════════

insert into public.produits (ref, produit, titre, accroche, detail, montant, lien, ordre, phare, actif)
values
  ('prd_amxzsj81', 'masterclass37', 'La masterclass complète (ancien lien)',
   'Ancienne référence Chariow, conservée pour les liens déjà partagés.',
   'Ne s''affiche nulle part. Sert uniquement à reconnaître un paiement arrivé par un lien antérieur.',
   37, null, 90, false, false),
  ('prd_mdjoug', 'coaching97', 'Le cercle (ancien lien)',
   'Ancienne référence Chariow, conservée pour les liens déjà partagés.',
   'Ne s''affiche nulle part. Sert uniquement à reconnaître un paiement arrivé par un lien antérieur.',
   97, null, 91, false, false)
on conflict (ref) do nothing;
