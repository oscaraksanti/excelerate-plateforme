-- ═══════════════════════════════════════════════════════════════════
--  Le rendez-vous du cercle
--
--  Quelqu'un qui règle 97 $ n'achète pas sept modules de plus : il
--  achète du temps avec Oscar. Or jusqu'ici rien, nulle part, ne lui
--  disait comment le prendre — ni le courriel de confirmation, ni la
--  plateforme. Jean Loua a payé hier soir et n'a aucun moyen de
--  réserver.
--
--  Le lien vit dans les réglages, pas dans le code : le jour où Oscar
--  change d'agenda, il le change lui-même, sans déploiement.
-- ═══════════════════════════════════════════════════════════════════

insert into public.reglages (cle, valeur)
values ('appel_cercle', jsonb_build_object(
  'lien',  'https://calendly.com/oscaraksanti/30min',
  'actif', true,
  'duree_min', 30
))
on conflict (cle) do update
  set valeur = excluded.valeur, maj_le = now();
