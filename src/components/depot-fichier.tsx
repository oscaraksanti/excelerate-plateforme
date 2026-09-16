"use client";

import { useRef, useState, type ReactNode } from "react";
import { clientNavigateur } from "@/lib/supabase/client";

/** Nom de fichier sûr : pas d'accent, pas d'espace, pas de surprise. */
function assainir(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-90);
}

export type ResultatDepot = { chemin: string; nom: string; taille: number };

/**
 * Envoie un fichier du navigateur DIRECTEMENT vers le stockage, puis
 * rend le chemin obtenu. Le fichier ne traverse jamais le serveur de la
 * plateforme : c'est ce qui permet a quatre cents personnes de deposer
 * en meme temps un mardi a 21 h.
 */
export function DepotFichier({
  espace,
  prefixe,
  accept = ".xlsx,.xlsm",
  tailleMaxMo = 10,
  libelle,
  libelleOccupe = "Envoi en cours…",
  discret = false,
  onDepose,
}: {
  espace: "ressources" | "depots" | "corriges";
  prefixe: string;
  accept?: string;
  tailleMaxMo?: number;
  libelle: ReactNode;
  libelleOccupe?: string;
  discret?: boolean;
  onDepose: (r: ResultatDepot) => void;
}) {
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  async function envoyer(fichier: File) {
    setErreur("");

    if (fichier.size === 0) {
      setErreur("Ce fichier est vide.");
      return;
    }
    if (fichier.size > tailleMaxMo * 1024 * 1024) {
      setErreur(`Ce fichier dépasse ${tailleMaxMo} Mo.`);
      return;
    }
    if (accept.includes(".xlsx") && !/\.(xlsx|xlsm)$/i.test(fichier.name)) {
      setErreur(
        "Il faut un classeur Excel (.xlsx). Dans Excel : Fichier → Enregistrer sous → Classeur Excel.",
      );
      return;
    }

    setOccupe(true);
    try {
      const chemin = `${prefixe}/${Date.now()}-${assainir(fichier.name)}`;
      const supabase = clientNavigateur();
      const { error } = await supabase.storage
        .from(espace)
        .upload(chemin, fichier, { cacheControl: "3600", upsert: false });

      if (error) {
        setErreur(`Le dépôt a échoué : ${error.message}`);
        return;
      }
      onDepose({ chemin, nom: fichier.name, taille: fichier.size });
    } finally {
      setOccupe(false);
      if (champ.current) champ.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="inline-flex w-fit cursor-pointer items-center gap-3">
        <span className={occupe || discret ? "bouton-2" : "bouton"}>
          {occupe ? libelleOccupe : libelle}
        </span>
        <input
          ref={champ}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={occupe}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void envoyer(f);
          }}
        />
      </label>

      {erreur && (
        <p
          role="alert"
          className="m-0 max-w-[34rem] border-l-[3px] border-ko bg-fond-2 px-4 py-3 text-[0.92rem] text-texte"
        >
          {erreur}
        </p>
      )}
    </div>
  );
}
