-- ═══════════════════════════════════════════════════════════════════
--  Retrait de la garantie de remboursement
--
--  Chariow ne sait pas rembourser. Une garantie inscrite dans un
--  document contractuel et dans l'argumentaire de vente, qu'on ne peut
--  pas honorer techniquement, est pire que pas de garantie du tout :
--  elle se retourne au premier mécontent.
--
--  L'essai existe déjà et il est plus fort qu'un remboursement : les
--  modules 0 à 3 sont gratuits et complets. On juge sur un quart du
--  contenu avant de payer.
-- ═══════════════════════════════════════════════════════════════════

update public.produits set
  detail = 'Power Query en profondeur, tableaux de bord, automatisation, '
         || 'et les cas que tu ne verras pas en trois soirées. Compris : '
         || 'l''accès à vie et toutes les vidéos à mesure qu''elles sortent, '
         || 'la bibliothèque de prompts de la formation, les 11 classeurs '
         || 'corrigés et commentés, le modèle de tableau de bord réutilisable, '
         || 'et le certificat avancé.'
where ref = 'prd_amxzsj81';
