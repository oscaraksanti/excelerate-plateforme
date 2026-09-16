/* eslint-disable @next/next/no-img-element */
import "./certificat.css";

export type DonneesCertificat = {
  code: string;
  nom_affiche: string;
  mention: string;
  corps: string;
  niveau: string;
  note: number | null;
  lieu: string;
  emis_le: string;
  revoque_le: string | null;
};

const CORPS_DEFAUT: Record<string, string> = {
  avance:
    "Au cours de cette formation, l'apprenant a acquis une **maîtrise avancée d'Excel boosté par l'intelligence artificielle**, notamment dans l'utilisation de **Power Query, Power Pivot, Tableaux Croisés Dynamiques**, ainsi que dans la **création de Tableaux de Bord interactifs**. Il a démontré sa capacité à **nettoyer, transformer, analyser et visualiser les données** de manière professionnelle. Grâce aux **cas pratiques et au projet final**, l'apprenant est désormais capable d'**exploiter la puissance des données** pour fournir des **insights stratégiques** et concevoir des solutions analytiques à fort impact.",
  fondamentaux:
    "Au cours de cette formation, l'apprenant a acquis les **méthodes qui font la différence sur Excel** : **tableaux structurés, RECHERCHEX, FILTRE, TRIER et UNIQUE**, ainsi que l'usage raisonné de **l'intelligence artificielle comme copilote d'analyse**. Il a rendu ses **travaux pratiques**, **corrigé ceux de ses pairs**, et démontré sa capacité à **structurer, analyser et présenter des données** de manière professionnelle et reproductible.",
};

/** Le gras du modèle d'origine, sans laisser passer de HTML. */
function enrichir(texte: string) {
  const morceaux = texte.split(/(\*\*[^*]+\*\*)/g);
  return morceaux.map((m, i) =>
    m.startsWith("**") && m.endsWith("**") ? (
      <b key={i}>{m.slice(2, -2)}</b>
    ) : (
      <span key={i}>{m}</span>
    ),
  );
}

function dateLongue(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Le certificat, aux dimensions exactes d'une A4 paysage.
 *
 * Georgia plutot qu'une police chargee du web : elle est presente sur
 * toutes les machines, elle s'imprime proprement, et elle est tres
 * proche du modele d'origine. Une police distante qui ne charge pas
 * abimerait le document au moment precis ou il compte.
 */
export function Certificat({
  c,
  urlVerification,
  qrSvg,
}: {
  c: DonneesCertificat;
  urlVerification: string;
  qrSvg: string;
}) {
  const corps = c.corps?.trim() || CORPS_DEFAUT[c.niveau] || CORPS_DEFAUT.fondamentaux;

  return (
    <div className="certificat">
      <div className="cadre-ext">
        <div className="cadre-int">
          <img src="/certificat/guilloche.jpg" alt="" className="guilloche" />

          {(
            [
              { cle: "hg", top: "5mm", left: "5mm" },
              { cle: "hd", top: "5mm", right: "5mm" },
              { cle: "bg", bottom: "5mm", left: "5mm" },
              { cle: "bd", bottom: "5mm", right: "5mm" },
            ] as const
          ).map(({ cle, ...pos }) => (
            <img key={cle} src="/certificat/coin.png" alt="" className="coin" style={pos} />
          ))}

          <header className="tete">
            <img src="/certificat/logo-eureka.png" alt="Eurêka Services" className="logo" />
            <img src="/certificat/trophee.png" alt="" className="trophee" />
          </header>

          <h1 className="mot">Certificat</h1>
          <p className="decerne">décerné à</p>
          <p className="nom">{c.nom_affiche}</p>
          <p className="pour">Pour avoir suivi avec succès une formation approfondie en</p>
          <p className="mention">{c.mention}</p>
          <p className="corps">{enrichir(corps)}</p>

          <img src="/certificat/cachet.png" alt="" className="cachet" />

          <footer className="pied">
            <div className="signataire gauche">
              <p className="qui">Dr Reagan LUVANDE, Msc</p>
              <p className="role">Épidémiologiste biostatisticien</p>
              <img src="/certificat/signature-reagan.png" alt="" className="paraphe" />
            </div>

            <div className="centre">
              <p className="fait">
                Fait à {c.lieu}, le {dateLongue(c.emis_le)}
              </p>
              <p className="ident">ID : {c.code}</p>
            </div>

            <div className="signataire droite">
              <p className="qui">Ir Oscar AKSANTI</p>
              <p className="role">Data Analyst &amp; Instructor</p>
              <img src="/certificat/signature-oscar.png" alt="" className="paraphe" />
            </div>
          </footer>

          <div className="verif">
            <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className="url">
              Vérifier l&apos;authenticité
              <br />
              <span>{urlVerification.replace(/^https?:\/\//, "")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
