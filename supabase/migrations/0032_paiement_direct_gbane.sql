-- ═══════════════════════════════════════════════════════════════════
--  Un paiement reçu en direct, hors Chariow
--
--  Mariam GBANE a envoyé les 37 $ sur le numéro d'Oscar, en mobile
--  money. L'argent est arrivé : c'est une vente, au même titre que
--  celles du Pulse, et elle ouvre exactement les mêmes accès.
--
--  Mais elle n'est PAS une vente Chariow, et on ne la maquille pas en
--  vente Chariow. La référence et la charge disent d'où elle vient :
--  le jour où l'on rapprochera les relevés Chariow et les comptes de
--  la plateforme, l'écart s'expliquera de lui-même au lieu de
--  ressembler à une erreur.
-- ═══════════════════════════════════════════════════════════════════

insert into public.achats (profil_id, email, produit, montant, chariow_ref, charge_utile)
select p.id, lower(p.email), 'masterclass37', 37, 'direct-mobile-gbane-mariam',
       jsonb_build_object(
         'origine',   'paiement direct',
         'moyen',     'mobile money, sur le numéro d''Oscar',
         'saisi_par', 'administration',
         'note',      'les 37 $ sont arrivés hors Chariow ; accès identique à une vente du Pulse')
from public.profils p
where lower(p.email) = 'mmedeazon1dmg@gmail.com'
on conflict (chariow_ref) do nothing;
