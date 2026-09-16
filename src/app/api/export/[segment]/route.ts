import { NextResponse, type NextRequest } from "next/server";
import { clientServeur } from "@/lib/supabase/serveur";

/** Les segments proposés, dans l'ordre où ils servent pendant la semaine. */
export const SEGMENTS: Record<string, string> = {
  tous: "Tous les inscrits",
  jamais_connectes: "Inscrits qui ne se sont jamais connectés",
  connectes: "Ont ouvert un compte",
  ont_rendu: "Ont déposé au moins un TP",
  rien_rendu: "Ont un compte mais n'ont rien rendu",
  ont_corrige: "Ont corrigé au moins une copie",
  acheteurs: "Acheteurs",
  non_acheteurs: "N'ont pas acheté",
};

function echapper(v: string | null) {
  const s = (v ?? "").replace(/"/g, '""');
  return /[",;\n]/.test(s) ? `"${s}"` : s;
}

export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ segment: string }> },
) {
  const { segment } = await params;
  if (!(segment in SEGMENTS)) {
    return NextResponse.json({ erreur: "Segment inconnu" }, { status: 404 });
  }

  // La fonction de la base vérifie elle-même que l'appelant est admin :
  // sans ça elle ne renvoie aucune ligne.
  const supabase = await clientServeur();
  const { data, error } = await supabase.rpc("segment", { p_nom: segment });

  if (error) {
    return NextResponse.json({ erreur: "Export impossible" }, { status: 500 });
  }

  const lignes = (data as { email: string; nom: string; telephone: string | null }[]) ?? [];

  // Point-virgule et BOM : c'est ce qu'attendent Excel en français et
  // systeme.io. Une virgule ouvrirait tout dans une seule colonne.
  const csv =
    "﻿" +
    ["email;nom;telephone"]
      .concat(
        lignes.map((l) =>
          [echapper(l.email), echapper(l.nom), echapper(l.telephone)].join(";"),
        ),
      )
      .join("\r\n");

  const jour = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="excelerate-${segment}-${jour}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
