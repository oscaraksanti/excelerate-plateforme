import { Fragment, type ReactNode } from "react";

/* ══════════════════════════════════════════════════════════════════
   Le texte d'un message, rendu sans jamais lui donner de pouvoir.

   Le contenu vient des participants. On ne l'interprète donc pas comme
   du HTML ni comme du markdown : on le découpe, et on fabrique de
   vrais éléments React. Rien de ce qu'écrit quelqu'un ne peut devenir
   une balise.

   Deux enrichissements, choisis pour ce cours :
     - les adresses web deviennent cliquables ;
     - ce qui est entre accents graves passe en monospace, parce que
       `=RECHERCHEX(A2;Table;3;0)` doit se lire comme une formule et
       non comme une phrase.
   ══════════════════════════════════════════════════════════════════ */

const ADRESSE = /https?:\/\/[^\s<>"'`]+/g;

/**
 * Une adresse en fin de phrase emporte la ponctuation. On la rend au
 * texte : « va sur https://exemple.com. » ne doit pas produire un lien
 * qui finit par un point.
 */
function sansPonctuationFinale(url: string): [string, string] {
  const m = /[.,;:!?»]+$/.exec(url);
  let lien = m ? url.slice(0, m.index) : url;
  let reste = m ? url.slice(m.index) : "";
  //  Une parenthèse fermante ne compte que si rien ne l'a ouverte
  //  dans l'adresse — certaines adresses en contiennent légitimement.
  if (lien.endsWith(")") && !lien.includes("(")) {
    reste = ")" + reste;
    lien = lien.slice(0, -1);
  }
  return [lien, reste];
}

function avecLiens(texte: string, cle: string): ReactNode[] {
  const sortie: ReactNode[] = [];
  let curseur = 0;
  let n = 0;

  for (const trouve of texte.matchAll(ADRESSE)) {
    const debut = trouve.index ?? 0;
    const [lien, reste] = sansPonctuationFinale(trouve[0]);
    if (debut > curseur) sortie.push(texte.slice(curseur, debut));
    sortie.push(
      <a
        key={`${cle}-l${n++}`}
        href={lien}
        target="_blank"
        //  nofollow : on n'offre pas notre réputation à ce qui est
        //  collé ici. noopener : la page ouverte ne reprend pas la
        //  main sur la nôtre.
        rel="nofollow noopener noreferrer"
        className="break-all underline decoration-[color:var(--voltage-2)] underline-offset-[3px] hover:text-texte"
      >
        {lien}
      </a>,
    );
    if (reste) sortie.push(reste);
    curseur = debut + trouve[0].length;
  }

  if (curseur < texte.length) sortie.push(texte.slice(curseur));
  return sortie;
}

export function TexteRiche({ texte }: { texte: string }) {
  //  On découpe d'abord sur les accents graves : une adresse écrite
  //  dans une formule reste alors du texte, ce qui est le bon
  //  comportement.
  const morceaux = texte.split(/(`[^`\n]+`)/g);

  return (
    <>
      {morceaux.map((m, i) =>
        m.startsWith("`") && m.endsWith("`") && m.length > 2 ? (
          <code
            key={i}
            className="rounded-[3px] bg-fond-3 px-[5px] py-[1px] font-mono text-[0.88em] text-texte"
          >
            {m.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{avecLiens(m, String(i))}</Fragment>
        ),
      )}
    </>
  );
}
