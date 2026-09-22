"use client";

import { useEffect, useState } from "react";
import { etatDirect, type Direct } from "@/lib/formats";

function reste(cible: number, maintenant: number) {
  const s = Math.max(0, Math.floor((cible - maintenant) / 1000));
  const j = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (j > 0) return `${j} j ${String(h).padStart(2, "0")} h ${String(m).padStart(2, "0")} min`;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min ${String(sec).padStart(2, "0")} s`;
  return `${m} min ${String(sec).padStart(2, "0")} s`;
}

export function BandeauDirect({ direct }: { direct: Direct }) {
  // Le rendu serveur et le premier rendu client doivent coïncider :
  // on n'affiche le compte à rebours qu'une fois monté.
  const [maintenant, setMaintenant] = useState<number | null>(null);

  useEffect(() => {
    const battre = () => setMaintenant(Date.now());
    const minuterie = setInterval(battre, 1000);
    //  La première mesure est différée d'un tour de boucle plutôt que
    //  posée dans le corps de l'effet : on la veut après la validation
    //  du rendu, pas pendant — sans quoi le montage déclenche un
    //  second rendu en cascade. L'écart ne se voit pas.
    const amorce = setTimeout(battre, 0);
    return () => {
      clearInterval(minuterie);
      clearTimeout(amorce);
    };
  }, []);

  if (maintenant === null) return null;

  const etat = etatDirect(direct, maintenant);
  if (etat === "eteint" || etat === "termine") return null;

  const debut = direct.debut_le ? new Date(direct.debut_le).getTime() : 0;
  const enDirect = etat === "pendant";

  return (
    <div
      className={`sticky top-0 z-20 border-b ${
        enDirect
          ? "border-[color:var(--voltage-2)] bg-encre text-papier"
          : "border-bord bg-fond-2"
      }`}
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-6 py-[10px]">
        <p className="m-0 flex items-center gap-[10px] text-[0.93rem]">
          <span
            aria-hidden="true"
            className={`inline-block h-[8px] w-[8px] rounded-full ${
              enDirect ? "animate-pulse bg-voltage" : "bg-ambre"
            }`}
          />
          {enDirect ? (
            <>
              <strong className="font-semibold">En direct maintenant</strong>
              <span className={enDirect ? "text-[#9AA6B4]" : "text-texte-2"}>
                {direct.titre}
              </span>
            </>
          ) : (
            <>
              <strong className="font-semibold">
                {direct.titre || "Prochaine soirée"}
              </strong>
              <span className="font-mono text-[0.85rem] tabular-nums text-texte-2">
                dans {reste(debut, maintenant)}
              </span>
            </>
          )}
        </p>

        {direct.lien && (
          <a
            href={direct.lien}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-[8px] px-4 py-[7px] text-[0.88rem] font-semibold transition-transform hover:-translate-y-[1px] ${
              enDirect
                ? "bg-voltage text-encre"
                : "border border-bord text-texte hover:border-texte-2"
            }`}
          >
            {enDirect ? "Rejoindre le direct" : "Ouvrir le lien Teams"}
          </a>
        )}
      </div>
    </div>
  );
}
