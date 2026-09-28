-- ═══════════════════════════════════════════════════════════════════
--  Le groupe privé des acheteurs
--
--  Il a été envoyé à la main aux vingt-sept premiers. Sans cette
--  ligne, il faudrait recommencer à chaque vente — et le vingt-huitième
--  paierait sans jamais savoir que le groupe existe.
--
--  Comme le lien de rendez-vous du cercle : dans les réglages, pas
--  dans le code, pour qu'Oscar puisse le changer le jour où le groupe
--  déménage.
-- ═══════════════════════════════════════════════════════════════════

insert into public.reglages (cle, valeur)
values ('groupe_prive', jsonb_build_object(
  'lien',  'https://chat.whatsapp.com/Kt2n45wFdABAht6eRf8kC9?s=cl&p=i&mlu=0&ilr=4',
  'actif', true,
  'nom',   'WhatsApp'
))
on conflict (cle) do update
  set valeur = excluded.valeur, maj_le = now();
