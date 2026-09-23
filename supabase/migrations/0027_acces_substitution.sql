-- ═══════════════════════════════════════════════════════════════════
--  Un accès accordé par substitution
--
--  Sonia Lynda avait réglé une autre formation ; celle-ci la remplace.
--  Ce n'est donc pas une vente Chariow, et on ne le maquille pas en
--  vente Chariow : la référence et la charge disent ce que c'est. Le
--  jour où on rapprochera les comptes, la distinction sautera aux yeux
--  au lieu de fausser le total.
-- ═══════════════════════════════════════════════════════════════════

insert into public.achats (profil_id, email, produit, montant, chariow_ref, charge_utile)
select p.id, 'sonialynda@gmail.com', 'masterclass37', 0, 'substitution-sonialynda',
       jsonb_build_object(
         'origine', 'substitution',
         'saisi_par', 'administration',
         'note', 'avait réglé une autre formation, remplacée par la masterclass Excelerate')
from public.profils p
where lower(p.email) = 'sonialynda@gmail.com'
on conflict (chariow_ref) do nothing;
