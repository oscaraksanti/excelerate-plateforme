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
  tps_rendus?: number;
  corrections?: number;
};

export type StyleCertificat = "selection" | "classique";

const ATTESTATION: Record<string, string> = {
  avance:
    "a suivi l'intégralité du programme, rendu ses travaux pratiques, corrigé ceux de ses pairs, et démontré sa maîtrise d'Excel augmenté par l'intelligence artificielle — de la structuration des données jusqu'au tableau de bord automatisé.",
  fondamentaux:
    "a suivi l'intégralité du programme, rendu ses travaux pratiques, corrigé ceux de ses pairs, et démontré sa maîtrise des méthodes qui font la différence sur Excel — tableaux structurés, fonctions dynamiques, et usage raisonné de l'intelligence artificielle.",
};

function dateLongue(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function dateCourte(iso: string) {
  return new Date(iso)
    .toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

/* ══════════════════════════════════════════════════════════════════
   A — « Sélection »

   Tous les marqueurs de confiance restent : logo et mentions légales,
   cachet, les deux paraphes, le trophée. Ce qui change, c'est la
   composition — le nom domine, la preuve s'affiche, et la trame de
   cellules remplace la guilloche : un certificat qui parle d'Excel n'a
   aucune raison d'emprunter le décor d'un diplôme de notaire.
   ══════════════════════════════════════════════════════════════════ */
function Selection({ c, url, qrSvg }: { c: DonneesCertificat; url: string; qrSvg: string }) {
  const attestation = ATTESTATION[c.niveau] ?? ATTESTATION.fondamentaux;
  const preuves = [
    { k: "Travaux rendus", v: String(c.tps_rendus ?? 0) },
    { k: "Copies corrigées", v: String(c.corrections ?? 0) },
    {
      k: "Moyenne obtenue",
      v: c.note !== null ? String(c.note).replace(".", ",") : "—",
      unite: c.note !== null ? "/20" : "",
    },
    { k: "Délivré le", v: dateCourte(c.emis_le) },
  ];

  return (
    <div className="cert cert-a">
      <div className="fond-grille" aria-hidden="true" />
      <div className="liseret">
        <span className="angle angle-hg" aria-hidden="true" />
        <span className="angle angle-bd" aria-hidden="true" />

        <header className="entete">
          <img src="/certificat/logo-eureka.png" alt="Eurêka Services" className="logo" />
          <img src="/certificat/trophee.png" alt="" className="trophee" />
        </header>

        <div className="corps-central">
          <p className="sur-titre">
            <span>Certificat de réussite</span>
            <span className="tiret" aria-hidden="true" />
            <span>{c.niveau === "avance" ? "Niveau avancé" : "Fondations"}</span>
          </p>

          <p className="nom">{c.nom_affiche}</p>
          <p className="liaison">a suivi et validé le programme</p>

          <span className="plage-mention">
            {c.mention}
            <span className="poignee-cert" aria-hidden="true" />
          </span>

          <p className="attestation">{attestation}</p>
        </div>

        <div className="preuves">
          {preuves.map((p) => (
            <div key={p.k} className="preuve">
              <span className="pk">{p.k}</span>
              <span className="pv">
                {p.v}
                {p.unite ? <i>{p.unite}</i> : null}
              </span>
            </div>
          ))}
        </div>

        <footer className="pied">
          <div className="sign">
            <img src="/certificat/signature-reagan.png" alt="" className="paraphe" />
            <span className="filet" aria-hidden="true" />
            <p className="qui">Dr Reagan LUVANDE, Msc</p>
            <p className="role">Épidémiologiste biostatisticien</p>
          </div>

          <div className="milieu">
            <img src="/certificat/cachet.png" alt="" className="cachet" />
            <p className="lieu-date">{c.lieu}, le {dateLongue(c.emis_le)}</p>
          </div>

          <div className="sign">
            <img src="/certificat/signature-oscar.png" alt="" className="paraphe" />
            <span className="filet" aria-hidden="true" />
            <p className="qui">Ir Oscar AKSANTI</p>
            <p className="role">Data Analyst &amp; Instructor</p>
          </div>
        </footer>

        <div className="barre-verif">
          <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p className="txt">
            <b>Vérifiable en ligne</b>
            <span>{url.replace(/^https?:\/\//, "")}</span>
          </p>
          <p className="code-cert">
            <span>Code</span>
            <b>{c.code}</b>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   B — « Classique tenue »

   La composition d'origine, débarrassée de ce qui la datait : plus de
   guilloche, un seul liseré au lieu de deux, une vraie hiérarchie de
   tailles, et l'accent de marque en une seule touche.
   ══════════════════════════════════════════════════════════════════ */
function Classique({ c, url, qrSvg }: { c: DonneesCertificat; url: string; qrSvg: string }) {
  const attestation = ATTESTATION[c.niveau] ?? ATTESTATION.fondamentaux;

  return (
    <div className="cert cert-b">
      <div className="liseret">
        <header className="entete">
          <img src="/certificat/logo-eureka.png" alt="Eurêka Services" className="logo" />
          <img src="/certificat/trophee.png" alt="" className="trophee" />
        </header>

        <p className="mot">Certificat</p>
        <p className="decerne">décerné à</p>
        <p className="nom">{c.nom_affiche}</p>
        <span className="souligne" aria-hidden="true" />
        <p className="pour">pour avoir suivi et validé le programme</p>
        <p className="mention">{c.mention}</p>
        <p className="attestation">{attestation}</p>

        <div className="preuves">
          <span>{c.tps_rendus ?? 0} travaux rendus</span>
          <span>{c.corrections ?? 0} copies corrigées</span>
          <span>Moyenne {c.note !== null ? String(c.note).replace(".", ",") : "—"} / 20</span>
        </div>

        <footer className="pied">
          <div className="sign">
            <p className="qui">Dr Reagan LUVANDE, Msc</p>
            <p className="role">Épidémiologiste biostatisticien</p>
            <img src="/certificat/signature-reagan.png" alt="" className="paraphe" />
          </div>
          <div className="milieu">
            <img src="/certificat/cachet.png" alt="" className="cachet" />
            <p className="lieu-date">Fait à {c.lieu}, le {dateLongue(c.emis_le)}</p>
            <p className="code-cert">ID : {c.code}</p>
          </div>
          <div className="sign">
            <p className="qui">Ir Oscar AKSANTI</p>
            <p className="role">Data Analyst &amp; Instructor</p>
            <img src="/certificat/signature-oscar.png" alt="" className="paraphe" />
          </div>
        </footer>

        <div className="barre-verif">
          <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p className="txt">
            Authenticité vérifiable sur <span>{url.replace(/^https?:\/\//, "")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Certificat({
  c, urlVerification, qrSvg, style = "selection",
}: {
  c: DonneesCertificat;
  urlVerification: string;
  qrSvg: string;
  style?: StyleCertificat;
}) {
  return style === "classique" ? (
    <Classique c={c} url={urlVerification} qrSvg={qrSvg} />
  ) : (
    <Selection c={c} url={urlVerification} qrSvg={qrSvg} />
  );
}
