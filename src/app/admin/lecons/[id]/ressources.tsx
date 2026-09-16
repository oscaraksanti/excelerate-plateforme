"use client";

import { useActionState, useRef, useState } from "react";
import { rattacherRessource, detacherRessource, type Etat } from "@/app/admin/actions";
import { clientNavigateur } from "@/lib/supabase/client";
import { formaterTaille } from "@/lib/formats";
import type { Ressource } from "@/lib/donnees";

const DEPART: Etat = { ok: false, message: "" };

/** Nom de fichier sûr : pas d'accent, pas d'espace, pas de surprise. */
function assainir(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-90);
}

export function Ressources({
  leconId,
  ressources,
}: {
  leconId: string;
  ressources: Ressource[];
}) {
  const [etat, rattacher] = useActionState(rattacherRessource, DEPART);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  const formulaire = useRef<HTMLFormElement>(null);
  const [depose, setDepose] = useState<{
    nom: string;
    chemin: string;
    taille: number;
  } | null>(null);

  async function envoyer(fichier: File) {
    setErreur("");
    if (fichier.size > 40 * 1024 * 1024) {
      setErreur("Ce fichier dépasse 40 Mo. Allège-le avant de le déposer.");
      return;
    }

    setEnvoi(true);
    try {
      // Le fichier part du navigateur directement vers le stockage :
      // il ne traverse jamais le serveur de la plateforme.
      const chemin = `${leconId}/${Date.now()}-${assainir(fichier.name)}`;
      const supabase = clientNavigateur();
      const { error } = await supabase.storage
        .from("ressources")
        .upload(chemin, fichier, { cacheControl: "3600", upsert: false });

      if (error) {
        setErreur(`Le dépôt a échoué : ${error.message}`);
        return;
      }

      setDepose({ nom: fichier.name, chemin, taille: fichier.size });
      // On laisse React poser les champs cachés avant de soumettre.
      requestAnimationFrame(() => formulaire.current?.requestSubmit());
    } finally {
      setEnvoi(false);
      if (champ.current) champ.current.value = "";
    }
  }

  return (
    <section className="mt-14 border-t-2 border-texte pt-6">
      <h2 className="titre-l m-0 mb-1 text-[1.5rem]">Les fichiers</h2>
      <p className="mt-2 mb-6 max-w-[34rem] text-[0.98rem] text-texte-2">
        Le classeur de départ, le corrigé public, un aide-mémoire. Ils
        apparaissent sous la vidéo, en téléchargement direct.
      </p>

      {ressources.length > 0 && (
        <ul className="m-0 mb-7 flex list-none flex-col gap-0 border-t border-bord p-0">
          {ressources.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 border-b border-bord-2 py-[13px]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.97rem] font-medium text-texte">
                  {r.nom}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase">
                  {formaterTaille(r.taille_octets)}
                </span>
              </span>
              <form action={detacherRessource}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="lecon_id" value={leconId} />
                <input type="hidden" name="chemin" value={r.chemin} />
                <button
                  type="submit"
                  className="cursor-pointer font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-ko"
                >
                  Retirer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <label className="inline-flex cursor-pointer items-center gap-3">
        <span className={envoi ? "bouton-2" : "bouton"}>
          {envoi ? "Dépôt en cours…" : "Ajouter un fichier"}
        </span>
        <input
          ref={champ}
          type="file"
          className="sr-only"
          disabled={envoi}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void envoyer(f);
          }}
        />
      </label>

      {/* Soumis automatiquement une fois le fichier dans le stockage. */}
      <form ref={formulaire} action={rattacher} className="hidden">
        <input type="hidden" name="lecon_id" value={leconId} />
        <input type="hidden" name="nom" value={depose?.nom ?? ""} />
        <input type="hidden" name="chemin" value={depose?.chemin ?? ""} />
        <input type="hidden" name="taille" value={depose?.taille ?? ""} />
      </form>

      {(erreur || etat.message) && (
        <p
          role="status"
          className={`mt-4 mb-0 max-w-[34rem] border-l-[3px] bg-fond-2 px-4 py-3 text-[0.92rem] text-texte ${
            erreur || !etat.ok ? "border-ko" : "border-[color:var(--voltage-2)]"
          }`}
        >
          {erreur || etat.message}
        </p>
      )}
    </section>
  );
}
