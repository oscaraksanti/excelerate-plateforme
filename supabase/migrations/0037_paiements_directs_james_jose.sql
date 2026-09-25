-- ═══════════════════════════════════════════════════════════════════
--  Deux masterclass réglées hors Chariow
--
--  James Siffrard par Western Union, Jose Lilolo par Airtel Money.
--  Même règle que pour Mariam GBANE et Camara Mamadouba : l'argent
--  est arrivé, donc l'accès s'ouvre ; la référence dit d'où vient la
--  vente, pour que l'écart avec le relevé Chariow s'explique au lieu
--  de ressembler à une erreur.
--
--  Leurs comptes ne portaient qu'un prénom — « James », « Jose ». Ils
--  ont maintenant payé : leur certificat ne peut pas rester bloqué
--  sur un champ. Oscar a donné les noms complets, on les pose.
-- ═══════════════════════════════════════════════════════════════════

insert into public.achats (profil_id, email, produit, montant, chariow_ref, charge_utile)
select p.id, lower(p.email), 'masterclass37', 37, v.ref,
       jsonb_build_object(
         'origine',   'paiement direct',
         'moyen',     v.moyen,
         'saisi_par', 'administration',
         'note',      'les 37 $ sont arrivés hors Chariow ; accès identique à une vente du Pulse')
from (values
  ('siffrard.james13@gmail.com', 'direct-westernunion-siffrard-james', 'Western Union'),
  ('lilolojose@gmail.com',       'direct-airtel-lilolo-jose',          'Airtel Money')
) as v(courriel, ref, moyen)
join public.profils p on lower(p.email) = v.courriel
on conflict (chariow_ref) do nothing;

--  On complète, on n'écrase pas : seuls les noms inutilisables changent.
update public.profils p
set nom = v.nom
from (values
  ('siffrard.james13@gmail.com', 'James Siffrard'),
  ('lilolojose@gmail.com',       'Jose Lilolo')
) as v(courriel, nom)
where lower(p.email) = v.courriel
  and not public.nom_complet(p.nom);
