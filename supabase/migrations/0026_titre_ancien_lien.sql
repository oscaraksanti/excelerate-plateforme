-- ═══════════════════════════════════════════════════════════════════
--  Le repère interne ne doit pas sortir dans un courriel
--
--  Les lignes « ancien lien » portaient la mention dans leur TITRE.
--  Or c'est le titre que le Pulse met dans la confirmation d'achat :
--  KOUAME SALIHO a reçu « C'est réglé — La masterclass complète
--  (ancien lien) ». Le repère de tenue de registre n'a rien à faire
--  sous les yeux d'un client qui vient de payer 37 $.
--
--  Le titre redevient celui du produit. La mention descend dans
--  l'accroche, qui ne sert qu'à l'administration.
-- ═══════════════════════════════════════════════════════════════════

update public.produits set
  titre    = 'La masterclass complète',
  accroche = 'Ancienne référence Chariow — invisible, sert à reconnaître un paiement venu d''un lien déjà partagé.'
where ref = 'prd_amxzsj81';

update public.produits set
  titre    = 'Le cercle',
  accroche = 'Ancienne référence Chariow — invisible, sert à reconnaître un paiement venu d''un lien déjà partagé.'
where ref = 'prd_mdjoug';
