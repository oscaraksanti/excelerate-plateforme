"use client";

import { useState } from "react";
import { enregistrerPhoto, retirerPhoto } from "@/app/profil/actions";
import { Avatar } from "@/components/avatar";
import { DepotFichier } from "@/components/depot-fichier";

/**
 * Changer sa photo.
 *
 * Le fichier part du navigateur droit vers le stockage, comme les
 * classeurs : il ne traverse jamais ce serveur. On n'enregistre
 * ensuite que le chemin.
 */
export function ChampPhoto({
  profilId,
  nom,
  avatar,
}: {
  profilId: string;
  nom: string;
  avatar: string | null;
}) {
  const [courant, setCourant] = useState(avatar);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar nom={nom} avatar={courant} taille={88} />

      <div className="flex flex-col gap-2">
        <DepotFichier
          espace="avatars"
          prefixe={profilId}
          accept="image/jpeg,image/png,image/webp"
          tailleMaxMo={2}
          discret
          libelle={courant ? "Changer ma photo" : "Ajouter une photo"}
          libelleOccupe="Envoi…"
          onDepose={async (r) => {
            const etat = await enregistrerPhoto(r.chemin);
            setMessage(etat.message);
            if (etat.ok) setCourant(r.chemin);
          }}
        />

        {courant && (
          <button
            type="button"
            onClick={async () => {
              const etat = await retirerPhoto();
              setMessage(etat.message);
              if (etat.ok) setCourant(null);
            }}
            className="cursor-pointer text-left font-mono text-[10px] tracking-[0.12em] text-texte-3 uppercase hover:text-ko"
          >
            Retirer la photo
          </button>
        )}

        <span className="text-[0.84rem] text-texte-3">
          JPEG, PNG ou WebP, 2 Mo au maximum. Elle apparaît dans l&apos;en-tête
          et dans le fil — jamais sur ton certificat.
        </span>

        {message && (
          <span role="status" className="text-[0.88rem] text-accent-texte">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
