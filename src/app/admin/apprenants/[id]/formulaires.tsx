"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { corrigerIdentite, delivrerPour, ecrire, relancerCette, type Etat } from "./actions";

const DEPART: Etat = { ok: false, message: "" };
const CHAMP =
  "w-full rounded-[6px] border border-bord bg-fond-2 px-3 py-[10px] text-[0.97rem] text-texte outline-none focus:border-[color:var(--plage-bord)]";

function Avis({ etat }: { etat: Etat }) {
  if (!etat.message) return null;
  return (
    <p
      role="status"
      className={`m-0 border-l-[3px] bg-fond-2 px-4 py-3 text-[0.94rem] text-texte ${
        etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
      }`}
    >
      {etat.message}
    </p>
  );
}

function Bouton({ libelle, occupe, discret }: { libelle: string; occupe: string; discret?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={discret ? "bouton-2" : "bouton"} disabled={pending}>
      {pending ? occupe : libelle}
    </button>
  );
}

/* ── L'identité ──────────────────────────────────────────────────── */

export function Identite({
  id,
  nom,
  telephone,
  complet,
}: {
  id: string;
  nom: string;
  telephone: string | null;
  complet: boolean;
}) {
  const [etat, action] = useActionState(corrigerIdentite, DEPART);

  return (
    <form action={action} className="flex max-w-[35rem] flex-col gap-4">
      <input type="hidden" name="profil_id" value={id} />

      <label className="flex flex-col gap-2">
        <span className="etiquette">Nom sur le certificat</span>
        <input name="nom" defaultValue={nom} className={CHAMP} />
        {!complet && (
          <span className="text-[0.86rem] text-ambre-texte">
            Incomplet — aucun certificat ne peut être établi tant qu&apos;il n&apos;y
            a pas deux mots.
          </span>
        )}
      </label>

      <label className="flex max-w-[16rem] flex-col gap-2">
        <span className="etiquette">Téléphone</span>
        <input name="telephone" defaultValue={telephone ?? ""} className={CHAMP} />
      </label>

      <Avis etat={etat} />
      <div>
        <Bouton libelle="Enregistrer" occupe="Enregistrement…" discret />
      </div>
    </form>
  );
}

/* ── La délivrance ───────────────────────────────────────────────── */

export function Delivrer({ id, niveauSuggere }: { id: string; niveauSuggere: string }) {
  const [etat, action] = useActionState(delivrerPour, DEPART);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="profil_id" value={id} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-2">
          <span className="etiquette">Niveau</span>
          <select name="niveau" defaultValue={niveauSuggere} className={`${CHAMP} w-[16rem]`}>
            <option value="fondamentaux">Fondations — modules gratuits</option>
            <option value="avance">Avancé — tout le programme</option>
          </select>
        </label>
        <Bouton libelle="Délivrer le certificat" occupe="Délivrance…" />
      </div>
      <Avis etat={etat} />
    </form>
  );
}

/* ── Les messages ────────────────────────────────────────────────── */

export function Messages({
  id,
  dansLeCercle,
  aUnCertificat,
}: {
  id: string;
  dansLeCercle: boolean;
  aUnCertificat: boolean;
}) {
  const [etat, action] = useActionState(relancerCette, DEPART);

  const choix = [
    { quoi: "corrections", libelle: "Relancer ses corrections" },
    { quoi: "depot", libelle: "Relancer son dépôt" },
    ...(dansLeCercle ? [{ quoi: "appel", libelle: "Renvoyer le lien d'appel" }] : []),
    ...(aUnCertificat ? [{ quoi: "certificat", libelle: "Renvoyer l'avis de certificat" }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {choix.map((c) => (
          <form key={c.quoi} action={action}>
            <input type="hidden" name="profil_id" value={id} />
            <input type="hidden" name="quoi" value={c.quoi} />
            <Bouton libelle={c.libelle} occupe="Envoi…" discret />
          </form>
        ))}
      </div>
      <Avis etat={etat} />
    </div>
  );
}

export function Ecrire({ id }: { id: string }) {
  const [etat, action] = useActionState(ecrire, DEPART);

  return (
    <form action={action} className="flex max-w-[35rem] flex-col gap-4">
      <input type="hidden" name="profil_id" value={id} />
      <label className="flex flex-col gap-2">
        <span className="etiquette">Objet</span>
        <input name="sujet" className={CHAMP} placeholder="Ton fichier du TP 2" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="etiquette">Message</span>
        <textarea name="message" rows={7} className={CHAMP} />
        <span className="text-[0.86rem] text-texte-3">
          Une ligne vide sépare deux paragraphes. Le message part dans
          l&apos;enveloppe de la plateforme, signé Eurêka Services.
        </span>
      </label>
      <Avis etat={etat} />
      <div>
        <Bouton libelle="Envoyer" occupe="Envoi…" />
      </div>
    </form>
  );
}
