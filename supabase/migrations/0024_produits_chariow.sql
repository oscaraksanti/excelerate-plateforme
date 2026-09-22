-- ═══════════════════════════════════════════════════════════════════
--  Les vraies références Chariow
--
--  La table portait encore « prd_amxzsj81 » et « prd_mdjoug », qui ne
--  correspondent plus à rien. Ça comptait : le Pulse cherche le
--  produit par la référence reçue, et sans correspondance il retombait
--  sur la masterclass par défaut — un achat d'accompagnement à 97 $
--  aurait été enregistré comme une masterclass à 37 $.
--
--  Vérifié un par un auprès de l'API Chariow :
--    prd_25rqe6qb  « Excel Boosté par l'IA — Les Bases »        27 $
--    prd_o3uqchm7  « ExceleraI MasterClass Complète »           37 $
--    prd_xzmmvl07  « Accompagnement Excel boosté par l'IA »     97 $
--  Les trois sont publiés.
-- ═══════════════════════════════════════════════════════════════════

update public.produits set
  ref  = 'prd_o3uqchm7',
  lien = 'https://vjiegixw.mychariow.shop/prd_o3uqchm7/checkout'
where produit = 'masterclass37';

update public.produits set
  ref  = 'prd_xzmmvl07',
  lien = 'https://vjiegixw.mychariow.shop/prd_xzmmvl07/checkout'
where produit = 'coaching97';

--  Le certificat reste inactif : il s'annonce après la formation, pas
--  pendant. Annoncé maintenant, il ancrerait toute l'audience en
--  dessous de la masterclass.
update public.produits set
  ref      = 'prd_25rqe6qb',
  lien     = 'https://vjiegixw.mychariow.shop/prd_25rqe6qb/checkout',
  titre    = 'Le certificat Fondations',
  accroche = 'La validation des modules 0 à 3, sans la suite.',
  detail   = 'Ton certificat vérifiable publiquement, avec ton nom, tes '
           || 'travaux rendus et ta note sur les trois soirées. Il n''ouvre '
           || 'pas les modules 4 à 10 : pour ça, c''est la masterclass.',
  ordre    = 1,
  actif    = false
where produit = 'certificat27';

-- ── Les deux paiements antérieurs au branchement du Pulse ───────────
--  Réglés hors plateforme : l'un en mobile money, l'autre par le lien
--  Chariow avant qu'un Pulse n'existe. Ils n'ont donc jamais produit
--  de notification. On les inscrit à la main, une fois, en le disant.
insert into public.achats (profil_id, email, produit, montant, chariow_ref, charge_utile)
select p.id, lower(v.email), 'masterclass37', 37, v.reference,
       jsonb_build_object(
         'origine', 'paiement antérieur au branchement du Pulse',
         'saisi_par', 'administration',
         'note', v.note)
from (values
  ('yvesrollandk@gmail.com', 'avant-pulse-yvesrollandk', 'réglé avant la mise en service du Pulse'),
  ('arianeumande@gmail.com', 'avant-pulse-arianeumande', 'réglé avant la mise en service du Pulse')
) as v(email, reference, note)
join public.profils p on lower(p.email) = v.email
on conflict (chariow_ref) do nothing;
