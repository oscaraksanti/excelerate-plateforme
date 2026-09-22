-- ═══════════════════════════════════════════════════════════════════
--  Le journal des Pulses de Chariow
--
--  Chariow réessaie une notification jusqu'à cinq fois si on ne répond
--  pas 2xx en moins de trente secondes. L'en-tête
--  « x-pulse-delivery-id » reste le même à chaque tentative : c'est la
--  clé qui permet de ne traiter une notification qu'une fois.
--
--  On journalise TOUTES les livraisons, y compris celles qu'on ignore
--  (paniers abandonnés, paiements échoués). D'abord pour ne pas les
--  retraiter ; ensuite parce que le jour où un accès manque, ce
--  journal est la seule chose qui dira ce que Chariow a réellement
--  envoyé.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.pulses (
  livraison_id text primary key,
  evenement    text not null,
  traite       boolean not null default false,
  motif        text,
  charge_utile jsonb,
  recu_le      timestamptz not null default now()
);

alter table public.pulses enable row level security;

--  Personne n'y touche depuis le navigateur : la route d'entrée écrit
--  avec les droits de service, et l'administration lit par le même
--  chemin. Aucune politique, donc aucun accès.
comment on table public.pulses is
  'Journal des notifications Chariow. Écrit uniquement par /api/chariow.';

create index if not exists pulses_recu_le on public.pulses(recu_le desc);
