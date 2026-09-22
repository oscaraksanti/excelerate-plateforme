"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════════
   Joindre une capture d'écran à un message.

   Deux soins, pour deux publics :

   - On redimensionne AVANT d'envoyer. Une capture d'écran brute pèse
     3 à 5 Mo ; sur une connexion de Kinshasa, envoyer ça c'est
     renoncer à poser sa question. À 1 600 px de côté et en webp, la
     même image fait 150 Ko et reste parfaitement lisible.

   - On accepte le collage. Sur Windows, « Win+Maj+S » puis « Ctrl+V »
     est LE geste de la capture d'écran. Sans lui, il faut enregistrer
     un fichier, le retrouver, le choisir — et on renonce.
   ══════════════════════════════════════════════════════════════════ */

const COTE_MAX = 1600;

async function reduire(fichier: File): Promise<File> {
  try {
    const image = await createImageBitmap(fichier);
    const facteur = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
    const l = Math.round(image.width * facteur);
    const h = Math.round(image.height * facteur);

    const toile = document.createElement("canvas");
    toile.width = l;
    toile.height = h;
    const ctx = toile.getContext("2d");
    if (!ctx) return fichier;
    ctx.drawImage(image, 0, 0, l, h);
    image.close();

    const blob = await new Promise<Blob | null>((r) =>
      toile.toBlob(r, "image/webp", 0.82),
    );
    if (!blob || blob.size === 0) return fichier;
    return new File([blob], "capture.webp", { type: "image/webp" });
  } catch {
    //  Navigateur trop ancien, image illisible : on envoie l'original.
    //  Le serveur a ses propres limites.
    return fichier;
  }
}

export function ChampCapture() {
  const entree = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  const vider = useCallback(() => {
    setApercu((a) => {
      if (a) URL.revokeObjectURL(a);
      return null;
    });
    if (entree.current) entree.current.value = "";
  }, []);

  const poser = useCallback(async (fichier: File) => {
    setOccupe(true);
    try {
      const reduit = await reduire(fichier);
      const transfert = new DataTransfer();
      transfert.items.add(reduit);
      if (entree.current) entree.current.files = transfert.files;
      setApercu((a) => {
        if (a) URL.revokeObjectURL(a);
        return URL.createObjectURL(reduit);
      });
    } finally {
      setOccupe(false);
    }
  }, []);

  //  Le collage se fait dans la zone de texte, pas sur ce bouton :
  //  on écoute donc au niveau du formulaire qui contient les deux.
  //  Et on vide l'aperçu quand le formulaire est remis à zéro, sinon
  //  l'image reste affichée après l'envoi.
  useEffect(() => {
    const form = entree.current?.form;
    if (!form) return;

    const surCollage = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) =>
        i.type.startsWith("image/"),
      );
      const fichier = item?.getAsFile();
      if (!fichier) return;
      e.preventDefault();
      void poser(fichier);
    };

    form.addEventListener("paste", surCollage);
    form.addEventListener("reset", vider);
    return () => {
      form.removeEventListener("paste", surCollage);
      form.removeEventListener("reset", vider);
    };
  }, [poser, vider]);

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={entree}
        type="file"
        name="capture"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void poser(f);
        }}
      />

      {apercu ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apercu}
            alt="Aperçu de la capture jointe"
            className="max-h-[110px] rounded-[3px] border border-bord"
          />
          <button
            type="button"
            onClick={vider}
            className="font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase hover:text-ko"
          >
            retirer
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={occupe}
          onClick={() => entree.current?.click()}
          className="self-start font-mono text-[10.5px] tracking-[0.1em] text-texte-3 uppercase transition-colors hover:text-texte disabled:opacity-50"
        >
          {occupe ? "préparation…" : "＋ joindre une capture"}
        </button>
      )}

      <p className="m-0 text-[0.8rem] leading-[1.45] text-texte-3">
        Vous pouvez coller directement avec <b>Ctrl+V</b>.{" "}
        <b className="text-texte-2">
          Masquez ce qui est confidentiel avant d&apos;envoyer
        </b>{" "}
        — salaires, noms de clients : tous les inscrits verront cette image.
      </p>
    </div>
  );
}
