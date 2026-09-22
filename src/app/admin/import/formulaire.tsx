"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import * as XLSX from "xlsx";
import { importerInscrits, type Bilan } from "./actions";
import { AIDE, CHAMP, LABEL } from "@/components/champs";

const DEPART: Bilan = { ok: false, message: "" };

type Ligne = { email: string; nom: string; telephone: string };

/** Reconnait les en-tetes quel que soit leur libelle exact. */
function deviner(entetes: string[]) {
  const norme = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const trouver = (mots: string[]) =>
    entetes.find((e) => mots.some((m) => norme(e).includes(m))) ?? "";
  return {
    email: trouver(["email", "mail", "adresse", "e-mail"]),
    nom: trouver(["nom", "name", "prenom", "first"]),
    telephone: trouver(["tel", "phone", "portable", "whatsapp", "numero"]),
  };
}

function Bouton({ nb }: { nb: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending || nb === 0}>
      {pending ? "Import en cours…" : `Importer ${nb} inscrit${nb > 1 ? "s" : ""}`}
    </button>
  );
}

export function FormulaireImport() {
  const [etat, action] = useActionState(importerInscrits, DEPART);
  const [entetes, setEntetes] = useState<string[]>([]);
  const [brutes, setBrutes] = useState<Record<string, unknown>[]>([]);
  const [colonnes, setColonnes] = useState({ email: "", nom: "", telephone: "" });
  const [nomFichier, setNomFichier] = useState("");
  const [erreur, setErreur] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  //  useActionState rend un objet neuf à chaque envoi. On s'en sert
  //  comme d'un jeton, et on ajuste l'état pendant le rendu : c'est ce
  //  que React recommande pour dériver un état, et ça évite le rendu
  //  en cascade d'un setState posé dans un effet.
  const [vu, setVu] = useState<Bilan>(DEPART);
  if (etat !== vu) {
    setVu(etat);
    if (etat.ok) {
      setBrutes([]);
      setEntetes([]);
      setNomFichier("");
    }
  }

  async function lire(fichier: File) {
    setErreur("");
    try {
      const wb = XLSX.read(await fichier.arrayBuffer(), { type: "array" });
      const feuille = wb.Sheets[wb.SheetNames[0]];
      if (!feuille) {
        setErreur("Ce fichier ne contient aucune feuille lisible.");
        return;
      }
      const lignes = XLSX.utils.sheet_to_json<Record<string, unknown>>(feuille, {
        defval: "",
      });
      if (lignes.length === 0) {
        setErreur("Ce fichier est vide.");
        return;
      }
      const cols = Object.keys(lignes[0]);
      setEntetes(cols);
      setColonnes(deviner(cols));
      setBrutes(lignes);
      setNomFichier(fichier.name);
    } catch {
      setErreur(
        "Lecture impossible. Exporte depuis systeme.io en .csv ou .xlsx, sans modifier le fichier.",
      );
    } finally {
      if (champ.current) champ.current.value = "";
    }
  }

  const lignes: Ligne[] = brutes.map((r) => ({
    email: String(r[colonnes.email] ?? ""),
    nom: String(r[colonnes.nom] ?? ""),
    telephone: String(r[colonnes.telephone] ?? ""),
  }));

  const valides = lignes.filter((l) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email.trim()));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="inline-flex w-fit cursor-pointer items-center gap-3">
          <span className={brutes.length ? "bouton-2" : "bouton"}>
            {brutes.length ? "Choisir un autre fichier" : "Choisir un fichier"}
          </span>
          <input
            ref={champ}
            type="file"
            accept=".csv,.xlsx,.xls,.txt"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void lire(f);
            }}
          />
        </label>
        {nomFichier && (
          <p className="mt-3 mb-0 font-mono text-[0.88rem] text-texte-2">
            {nomFichier} · {brutes.length} ligne{brutes.length > 1 ? "s" : ""}
          </p>
        )}
        {erreur && (
          <p className="mt-3 mb-0 max-w-[34rem] border-l-[3px] border-ko bg-fond-2 px-4 py-3 text-[0.92rem]">
            {erreur}
          </p>
        )}
      </div>

      {entetes.length > 0 && (
        <>
          <section>
            <h3 className="titre-m m-0 mb-4 text-[1.1rem]">Les colonnes</h3>
            <div className="flex flex-wrap gap-5">
              {(["email", "nom", "telephone"] as const).map((c) => (
                <div key={c} className="flex w-[13rem] flex-col gap-2">
                  <label htmlFor={`col-${c}`} className={LABEL}>
                    {c === "telephone" ? "Téléphone" : c === "email" ? "Email" : "Nom"}
                    {c === "email" && " (requis)"}
                  </label>
                  <select
                    id={`col-${c}`}
                    value={colonnes[c]}
                    onChange={(e) => setColonnes({ ...colonnes, [c]: e.target.value })}
                    className={CHAMP}
                  >
                    <option value="">—</option>
                    {entetes.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <p className={`${AIDE} mt-3`}>
              Les colonnes sont devinées depuis les en-têtes. Corrige-les si le
              rapprochement est faux.
            </p>
          </section>

          <section>
            <h3 className="titre-m m-0 mb-4 text-[1.1rem]">
              Aperçu — {valides.length} adresse{valides.length > 1 ? "s" : ""} valide
              {valides.length > 1 ? "s" : ""} sur {lignes.length}
            </h3>
            <div className="overflow-x-auto rounded-[10px] border border-bord">
              <table className="w-full min-w-[520px] border-collapse text-[0.88rem]">
                <thead>
                  <tr>
                    {["Email", "Nom", "Téléphone"].map((t) => (
                      <th
                        key={t}
                        className="border-b border-bord bg-fond-2 px-[13px] py-[10px] text-left font-mono text-[9.5px] font-semibold tracking-[0.13em] text-texte-2 uppercase"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignes.slice(0, 6).map((l, i) => {
                    const bon = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email.trim());
                    return (
                      <tr key={i} className={bon ? "" : "bg-[color:rgba(190,59,48,.07)]"}>
                        <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] text-texte">
                          {l.email || "—"}
                        </td>
                        <td className="border-b border-bord-2 px-[13px] py-[10px] text-texte-2">
                          {l.nom || "—"}
                        </td>
                        <td className="border-b border-bord-2 px-[13px] py-[10px] font-mono text-[11.5px] text-texte-2">
                          {l.telephone || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {lignes.length > 6 && (
              <p className={`${AIDE} mt-3`}>… et {lignes.length - 6} autres.</p>
            )}
          </section>

          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="lignes" value={JSON.stringify(valides)} />
            <input
              type="hidden"
              name="lot"
              value={new Date().toISOString().slice(0, 10)}
            />
            <div>
              <Bouton nb={valides.length} />
            </div>
            <p className={AIDE}>
              Les doublons et les adresses invalides sont écartés. Réimporter le
              même fichier ne crée pas de doublon — les fiches existantes sont
              mises à jour.
            </p>
          </form>
        </>
      )}

      {etat.message && (
        <div
          role="status"
          className={`max-w-[36rem] border-l-[3px] bg-fond-2 px-4 py-4 ${
            etat.ok ? "border-[color:var(--voltage-2)]" : "border-ko"
          }`}
        >
          <p className="m-0 text-[0.97rem] font-semibold text-texte">{etat.message}</p>
          {etat.ok && (
            <p className="m-0 mt-2 text-[0.91rem] text-texte-2">
              {etat.ignores
                ? `${etat.ignores} ligne(s) écartée(s) : doublons ou adresses invalides.`
                : "Aucune ligne écartée."}
            </p>
          )}
          {etat.invalides && etat.invalides.length > 0 && (
            <p className="m-0 mt-2 font-mono text-[0.82rem] text-texte-3">
              Exemples écartés : {etat.invalides.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
