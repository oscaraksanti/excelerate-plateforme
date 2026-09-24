-- ═══════════════════════════════════════════════════════════════════
--  Le cercle, réglé en Airtel Money
--
--  Camara Mamadouba a envoyé les 97 $ sur le numéro d'Oscar. Même
--  règle que pour Mariam GBANE : l'argent est arrivé, donc l'accès
--  s'ouvre, mais la référence dit d'où vient la vente. Ce qui ne
--  figure pas dans le relevé Chariow ne doit pas ressembler à une
--  erreur de rapprochement.
-- ═══════════════════════════════════════════════════════════════════

insert into public.achats (profil_id, email, produit, montant, chariow_ref, charge_utile)
select p.id, lower(p.email), 'coaching97', 97, 'direct-airtel-camara-mamadouba',
       jsonb_build_object(
         'origine',   'paiement direct',
         'moyen',     'Airtel Money, sur le numéro d''Oscar',
         'saisi_par', 'administration',
         'note',      'les 97 $ sont arrivés hors Chariow ; accès identique à une vente du Pulse')
from public.profils p
where lower(p.email) = 'mamadoubacamara49@gmail.com'
on conflict (chariow_ref) do nothing;
