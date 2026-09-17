/**
 * Vérifie qu'un corrigé de TP se note bien 20/20.
 *
 * C'est le seul test qui compte avant de publier un travail pratique :
 * il attrape la feuille mal nommée, la formule qui n'a jamais été
 * recalculée, la matricielle mal posée. À relancer pour chaque TP.
 *
 *   node --experimental-strip-types outils/verifier-tp.mjs 1
 */
import { createClient } from "@supabase/supabase-js";
import { analyser, ouvrirClasseur } from "../src/lib/correcteur.ts";

const numero = Number(process.argv[2] ?? 1);
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: mod } = await db.from("modules").select("id").eq("numero", numero).single();
const { data: tp } = await db
  .from("tps").select("id, titre, fichier_depart")
  .eq("module_id", mod.id).eq("numero", 1).single();
const { data: c } = await db.from("corriges").select("chemin").eq("tp_id", tp.id).single();

if (!c) { console.error("✗ Ce TP n'a pas de corrigé."); process.exit(1); }

const [{ data: refB }, { data: depB }] = await Promise.all([
  db.storage.from("corriges").download(c.chemin),
  db.storage.from("ressources").download(tp.fichier_depart),
]);

const ref = ouvrirClasseur(Buffer.from(await refB.arrayBuffer()));
const auto = analyser(ref, ref);
const vide = analyser(ref, ouvrirClasseur(Buffer.from(await depB.arrayBuffer())));

console.log(`\n${tp.titre}`);
console.log(`  corrigé déposé tel quel  → ${auto.sur20}/20  (${auto.obtenu}/${auto.total})`);
console.log(`  départ rendu sans rien   → ${vide.sur20}/20`);

const perdues = auto.lignes.filter((l) => l.obtenu < l.total);
if (perdues.length === 0) {
  console.log("\n✓ Le corrigé se note 20/20. Le TP peut être publié.");
} else {
  console.log(`\n🔴 ${perdues.length} point(s) que personne ne peut obtenir :`);
  for (const l of perdues)
    console.log(`   ${l.ou} — attendu ${JSON.stringify(l.attVal)} · formule « ${l.attFn} »`);
  process.exit(1);
}
