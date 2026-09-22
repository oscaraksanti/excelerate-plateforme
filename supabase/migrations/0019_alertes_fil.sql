-- ═══════════════════════════════════════════════════════════════════
--  Ne pas noyer l'auteur d'une question
--
--  Dix réponses sur un fil ne doivent pas faire dix courriels : la
--  personne se désabonne, et on perd le canal pour de bon. Cette date
--  retient quand la dernière alerte est partie pour ce fil ; on n'en
--  renvoie pas avant une heure.
-- ═══════════════════════════════════════════════════════════════════

alter table public.commentaires
  add column if not exists alerte_le timestamptz;

comment on column public.commentaires.alerte_le is
  'Sur un message d''ouverture : quand son auteur a été prévenu pour la dernière fois.';
