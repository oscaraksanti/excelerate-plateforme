-- ═══════════════════════════════════════════════════════════════════
--  Une leçon peut n'avoir aucune vidéo, et c'est normal
--
--  Jusqu'ici la plateforme ne savait pas distinguer « pas de vidéo »
--  de « vidéo pas encore mise ». Toute leçon sans lien affichait donc :
--
--      « La vidéo de cette leçon sera publiée après le direct. »
--
--  Faux deux fois : les directs sont terminés, et pour une leçon en
--  texte seul cette vidéo n'arrivera jamais. Quarante des cinquante-
--  cinq leçons publiées portaient cette promesse.
--
--  Trois états désormais :
--    · un lien              → le lecteur
--    · sans_video = true    → le texte seul, et rien d'autre
--    · ni l'un ni l'autre   → « la vidéo arrive bientôt »
--
--  Un lien l'emporte toujours : le jour où Oscar colle un
--  identifiant, la vidéo s'affiche même s'il oublie de décocher —
--  l'enregistrement remet le drapeau à faux tout seul.
-- ═══════════════════════════════════════════════════════════════════

alter table public.lecons
  add column if not exists sans_video boolean not null default false;

comment on column public.lecons.sans_video is
  'Cette leçon est en texte seul : ne rien afficher à la place du lecteur. '
  'Ignoré dès qu''un video_id existe.';

--  Les quarante leçons qui n'ont pas de vidéo passent en texte seul :
--  c'est ce qu'elles sont aujourd'hui, et une promesse d'attente vaut
--  moins qu'un cours qui commence tout de suite. Coller un lien plus
--  tard suffira à les faire revenir en vidéo.
update public.lecons
set sans_video = true
where coalesce(nullif(btrim(coalesce(video_id, '')), ''), null) is null;
