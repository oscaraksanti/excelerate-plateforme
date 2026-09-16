const LIEN_INSCRIPTION = "https://formations4data.systeme.io/excel-ia-gratuit";
const LIEN_TELEGRAM = "https://t.me/ExcelPowerBiPourEntreprises";

const COLONNES = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

const SOIREES = [
  {
    jour: "Lundi 21",
    cell: "B4",
    titre: "Arrêter de se battre avec ses données",
    contenu:
      "Les tableaux structurés, RECHERCHEX, et les trois fonctions qu'Excel 2024 a rendues disponibles sans que personne ne le dise : FILTRE, TRIER, UNIQUE.",
  },
  {
    jour: "Mardi 22",
    cell: "B5",
    titre: "L'IA comme copilote, pas comme oracle",
    contenu:
      "Faire auditer un fichier existant, structurer une demande pour obtenir une formule juste — et reconnaître les cas où l'IA se trompe avec assurance.",
  },
  {
    jour: "Mercredi 23",
    cell: "B6",
    titre: "Ce qui tourne tout seul",
    contenu:
      "Power Query pour nettoyer une fois pour toutes, LET pour des formules lisibles, et un tableau de bord qui se met à jour sans qu'on y touche.",
  },
];

export default function Accueil() {
  return (
    <>
      <div className="trame" aria-hidden="true" />

      <main className="relative z-1 mx-auto max-w-[1000px] px-6 pb-28">
        {/* Bandeau des lettres de colonnes */}
        <div
          className="mb-8 flex overflow-hidden border-b border-bord-2 pt-12 font-mono text-[10.5px] tracking-[0.14em] text-texte-3"
          aria-hidden="true"
        >
          {COLONNES.map((c, i) => (
            <span
              key={c}
              className={`flex-[0_0_48px] border-r border-bord-2 pb-[5px] text-center ${
                i === 0 ? "bg-fond-3 text-texte-2" : ""
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="etiquette mb-6 flex items-center gap-[10px]">
          <i className="h-[7px] w-[7px] rounded-full bg-voltage not-italic" />
          <span>
            Excelerate IA · <span className="text-texte">Oscar Aksanti</span>
          </span>
        </div>

        <h1 className="titre-xl m-0 mb-6 text-[clamp(2.4rem,6.2vw,4rem)]">
          Trois soirées
          <br />
          <span className="text-texte-2 [font-variation-settings:'wdth'_104,'wght'_500]">
            pour changer de niveau.
          </span>
        </h1>

        <p className="mb-8 max-w-[34rem] text-[1.16rem] leading-[1.55] text-texte-2">
          Du <strong className="font-semibold text-texte">21 au 23 septembre</strong>,
          de 19 h à 21 h. En direct, gratuit, et conçu pour qu'un utilisateur
          d'Excel de dix ans reparte avec autant qu'un débutant.
        </p>

        <div className="barre-formule mb-12 max-w-[34rem]">
          <span className="ref">A1</span>
          <span className="fx">fx</span>
          <span className="val">
            =SI(présent_les_3_soirs;{" "}
            <b className="font-semibold text-accent-texte">&quot;certificat&quot;</b>;
            &quot;regrets&quot;)
          </span>
        </div>

        {/* Le programme */}
        <section className="border-t-2 border-texte pt-4">
          <h2 className="titre-l m-0 text-[clamp(1.5rem,3vw,1.9rem)]">
            Le programme
          </h2>
          <p className="mt-3 mb-7 max-w-[34rem] text-texte-2">
            Trois méthodes, pas trois listes de fonctions. Chaque soir se termine
            par un travail pratique corrigé par tes pairs.
          </p>

          <ol className="m-0 grid list-none gap-0 border-t border-bord p-0">
            {SOIREES.map((s) => (
              <li
                key={s.jour}
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-bord py-6 sm:grid-cols-[104px_minmax(0,1fr)]"
              >
                <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-texte-2">
                    {s.jour}
                  </span>
                  <span className="font-mono text-[11px] text-texte-3">
                    {s.cell}
                  </span>
                </div>
                <div>
                  <h3 className="titre-m m-0 mb-2 text-[1.2rem]">{s.titre}</h3>
                  <p className="m-0 max-w-[33rem] text-[0.97rem] text-texte-2">
                    {s.contenu}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* L'accès */}
        <section className="mt-16">
          <div className="plage inline-block px-6 py-5">
            <span className="etiquette mb-2 block">L&apos;accès à la plateforme</span>
            <p className="m-0 max-w-[31rem] text-[1.04rem] leading-[1.5]">
              Elle ouvre <strong className="font-semibold">dimanche 20 septembre</strong>.
              Tu recevras ton lien de connexion par email — pas de mot de passe à
              retenir, pas de compte à créer.
            </p>
            <span className="poignee" aria-hidden="true" />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a className="bouton" href={LIEN_INSCRIPTION}>
              Réserver ma place — c&apos;est gratuit
            </a>
            <a className="bouton-2" href={LIEN_TELEGRAM}>
              Rejoindre le groupe Telegram
            </a>
          </div>

          <p className="mt-6 max-w-[34rem] text-[0.92rem] text-texte-3">
            Déjà inscrit ? Tu n&apos;as rien à refaire. Ton accès arrivera à
            l&apos;adresse utilisée lors de ton inscription.
          </p>
        </section>

        <footer className="mt-20 border-t border-bord pt-5">
          <p className="etiquette m-0">
            excelai.oscaraksanti.com · Eurêka Services · Oscar Aksanti
          </p>
        </footer>
      </main>
    </>
  );
}
