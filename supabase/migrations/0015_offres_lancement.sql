-- ═══════════════════════════════════════════════════════════════════
--  Les offres du lancement
--
--  Trois changements, tous dictés par une contrainte : le temps
--  d'Oscar. L'accompagnement individuel devenait une dette dès la
--  trentième vente, alors il passe en groupe — quatre séances qui
--  coûtent six heures, que dix personnes achètent ou cinquante.
--
--  Et les dix premières places doivent se compter pour de vrai. Une
--  rareté annoncée sans compteur est une rareté fausse, et ce public
--  l'a déjà vue cent fois.
-- ═══════════════════════════════════════════════════════════════════

-- ── Combien de places bonus, et combien en reste-t-il ───────────────
insert into public.reglages (cle, valeur)
values ('places_bonus', '{"total": 10}'::jsonb)
on conflict (cle) do nothing;

--  Lisible sans compte : le compteur s'affiche sur la page d'accueil,
--  devant des gens qui ne se sont pas encore inscrits. Il ne sort
--  qu'un nombre — aucune adresse, aucun montant, aucun nom.
create or replace function public.places_restantes()
returns table (total int, prises int, restantes int)
language sql stable security definer set search_path = ''
as $$
  with config as (
    select coalesce(
      ((select valeur from public.reglages where cle = 'places_bonus') ->> 'total')::int,
      10
    ) as total
  ),
  compte as (
    select count(*)::int as prises
    from public.achats
    where produit in ('masterclass37','coaching97','equipe')
  )
  select c.total, m.prises, greatest(0, c.total - m.prises)::int
  from config c, compte m;
$$;

grant execute on function public.places_restantes() to anon, authenticated;

-- ── La masterclass : ce qu'elle contient vraiment ───────────────────
--  Tout ce qui ne coûte rien à dupliquer va à tout le monde. Le
--  réserver aux dix premiers ne créerait aucune rareté réelle, et
--  appauvrirait la ligne qui porte l'essentiel des recettes.
update public.produits set
  accroche = '7 modules de plus, le certificat, et tout ce qui va avec.',
  detail   = 'Power Query en profondeur, tableaux de bord, automatisation, '
           || 'et les cas que tu ne verras pas en trois soirées. Compris : '
           || 'l''accès à vie et toutes les vidéos à mesure qu''elles sortent, '
           || 'la bibliothèque de prompts de la formation, les 11 classeurs '
           || 'corrigés et commentés, le modèle de tableau de bord réutilisable, '
           || 'et le certificat avancé. Garanti 30 jours, remboursé sans question.'
where ref = 'prd_amxzsj81';

-- ── L'accompagnement devient un cercle ──────────────────────────────
--  Le produit garde sa clé 'coaching97' : elle est inscrite dans
--  a_acces_paye() et dans les achats déjà enregistrés. Seul change ce
--  qu'on promet — et ce qu'on promet est désormais tenable.
update public.produits set
  titre    = 'Le cercle',
  accroche = 'La masterclass, plus quatre séances en direct avec Oscar.',
  detail   = 'Tout ce que contient la masterclass, et en plus : quatre '
           || 'séances de groupe de 90 minutes, une par semaine à partir du '
           || '28 septembre, où l''on corrige des copies réelles à l''écran — '
           || 'on apprend autant de celle des autres que de la sienne. Plus '
           || 'un canal privé où Oscar répond.'
where ref = 'prd_mdjoug';

-- ── La porte entreprise ─────────────────────────────────────────────
--  Inactive tant qu'Oscar n'a pas créé le produit côté Chariow : sans
--  lien de paiement, une offre visible est une impasse.
insert into public.produits (ref, produit, titre, accroche, detail, montant, lien, ordre, phare, actif)
values (
  'equipe_497', 'equipe', 'Équipe',
  'Cinq accès pour une même entreprise, et une séance sur vos données.',
  'Cinq personnes de la même structure suivent toute la masterclass et '
  || 'passent le certificat. En plus : une séance dédiée où l''on travaille '
  || 'sur vos fichiers à vous, pas sur un cas d''école.',
  497, null, 4, false, false
)
on conflict (ref) do nothing;
