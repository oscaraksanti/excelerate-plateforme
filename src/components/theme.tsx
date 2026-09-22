"use client";

import { useSyncExternalStore } from "react";

type Choix = "clair" | "sombre" | "systeme";
const CLE = "excelai-theme";

const OPTIONS: { valeur: Choix; libelle: string; titre: string }[] = [
  { valeur: "clair", libelle: "☀", titre: "Thème clair" },
  { valeur: "sombre", libelle: "☾", titre: "Thème sombre" },
  { valeur: "systeme", libelle: "◐", titre: "Suivre le système" },
];

export function appliquerTheme(choix: Choix) {
  const racine = document.documentElement;
  if (choix === "systeme") racine.removeAttribute("data-theme");
  else racine.setAttribute("data-theme", choix === "clair" ? "light" : "dark");
}

/* ── Le choix, lu là où il vit vraiment ────────────────────────────
   Le stockage local est un système extérieur à React. Le lire dans un
   effet pour le recopier dans un état marchait, mais provoquait un
   second rendu à chaque montage. useSyncExternalStore est fait pour
   exactement ça — et son troisième argument, « systeme », est ce que
   rend le serveur, ce qui garantit que l'hydratation coïncide sans
   avoir à traîner un drapeau « monté ». */

const abonnes = new Set<() => void>();

function abonner(prevenir: () => void) {
  abonnes.add(prevenir);
  return () => {
    abonnes.delete(prevenir);
  };
}

function lireChoix(): Choix {
  try {
    const v = localStorage.getItem(CLE);
    if (v === "clair" || v === "sombre" || v === "systeme") return v;
  } catch {
    /* navigation privée, stockage refusé : on reste sur « système » */
  }
  return "systeme";
}

const DEFAUT: Choix = "systeme";
const lireDefaut = () => DEFAUT;

export function SelecteurTheme() {
  const choix = useSyncExternalStore(abonner, lireChoix, lireDefaut);

  function changer(v: Choix) {
    appliquerTheme(v);
    try {
      localStorage.setItem(CLE, v);
    } catch {
      /* sans conséquence : le thème s'applique quand même pour cette visite */
    }
    for (const prevenir of abonnes) prevenir();
  }

  return (
    <div
      role="group"
      aria-label="Thème"
      className="flex items-center gap-[2px] rounded-[6px] border border-bord p-[2px]"
    >
      {OPTIONS.map((o) => {
        const actif = choix === o.valeur;
        return (
          <button
            key={o.valeur}
            type="button"
            title={o.titre}
            aria-label={o.titre}
            aria-pressed={actif}
            onClick={() => changer(o.valeur)}
            className={`cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[12px] leading-none transition-colors ${
              actif ? "bg-fond-3 text-texte" : "text-texte-3 hover:text-texte-2"
            }`}
          >
            {o.libelle}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Applique le theme avant le premier rendu.
 * Sans ca, une page sombre clignote en blanc a chaque chargement — le
 * genre de detail qui fait « pas fini » sans qu'on sache pourquoi.
 */
export const SCRIPT_THEME = `(function(){try{var v=localStorage.getItem("${CLE}");if(v==="clair")document.documentElement.setAttribute("data-theme","light");else if(v==="sombre")document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;
