import "server-only";

const EXPEDITEUR = "Oscar Aksanti <oscar@mail.excelai.oscaraksanti.com>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://excelai.oscaraksanti.com";

function echapper(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * L'enveloppe commune. HTML volontairement sobre : les messageries
 * filtrent moins les emails simples, et on en envoie beaucoup.
 */
function enveloppe(titre: string, corps: string, bouton?: { texte: string; lien: string }) {
  return `<div style="margin:0;padding:24px;background:#f7f9fa;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d7dde3;border-radius:10px;">
<tr><td style="padding:28px 28px 0 28px;">
<p style="margin:0 0 22px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#57616d;">&#9679;&nbsp; EXCELERATE IA</p>
<h1 style="margin:0 0 14px 0;font-size:23px;line-height:1.25;color:#0b0e13;font-weight:800;letter-spacing:-0.4px;">${titre}</h1>
${corps}
</td></tr>
${
  bouton
    ? `<tr><td style="padding:6px 28px 0 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background:#0b0e13;border-radius:10px;">
<a href="${bouton.lien}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#c8f04b;text-decoration:none;">${bouton.texte}</a>
</td></tr></table></td></tr>`
    : ""
}
<tr><td style="padding:24px 28px 28px 28px;">
<p style="margin:0;padding-top:18px;border-top:1px solid #e4e9ed;font-size:12px;line-height:1.6;color:#8a96a4;">
Eurêka Services &middot; Oscar Aksanti<br>
<a href="${SITE}" style="color:#57616d;">${SITE.replace(/^https?:\/\//, "")}</a>
</p>
</td></tr></table></div>`;
}

const P = (t: string) =>
  `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#57616d;">${t}</p>`;

type Envoi = { a: string; sujet: string; titre: string; corps: string; bouton?: { texte: string; lien: string }; texte: string };

/**
 * Envoie un courriel. Ne leve jamais : un envoi rate ne doit pas faire
 * echouer le depot d'une copie ni la delivrance d'un certificat.
 */
async function envoyer(e: Envoi): Promise<boolean> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.warn("[courriel] RESEND_API_KEY absente — envoi ignoré");
    return false;
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EXPEDITEUR,
        to: [e.a],
        subject: e.sujet,
        html: enveloppe(e.titre, e.corps, e.bouton),
        text: e.texte,
      }),
    });
    if (!r.ok) {
      console.error("[courriel] refus de Resend", r.status, await r.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[courriel] envoi impossible", err);
    return false;
  }
}

/* ── Une copie vient d'être déposée ──────────────────────────────── */

export async function courrielCopieDeposee(opts: {
  a: string;
  prenom: string;
  tp: string;
  note: number | null;
  restant: number;
  lien: string;
}) {
  const { prenom, tp, note, restant, lien } = opts;
  const salut = prenom ? `Bonjour ${echapper(prenom)},` : "Bonjour,";

  const laNote =
    note === null
      ? "Ta note arrivera dès que le corrigé sera en ligne."
      : `La machine a vérifié tes formules et tes résultats : <b style="color:#0b0e13;">${String(note).replace(".", ",")} / 20</b>.`;

  const laSuite =
    restant > 0
      ? `Il te reste <b style="color:#0b0e13;">${restant} copie${restant > 1 ? "s" : ""}</b> à corriger avant de voir la note de tes pairs sur la tienne. Ce n'est pas une punition : voir comment d'autres ont résolu le même problème apprend souvent plus que sa propre note.`
      : "Tu as rendu toutes tes corrections : la note de tes pairs est visible sur ta copie.";

  return envoyer({
    a: opts.a,
    sujet: `Ta copie est bien arrivée — ${tp}`,
    titre: "Copie reçue",
    corps: [P(salut), P(`Ton classeur pour <b style="color:#0b0e13;">${echapper(tp)}</b> est enregistré.`), P(laNote), P(laSuite)].join(""),
    bouton: { texte: restant > 0 ? "Corriger des copies" : "Voir ma correction", lien },
    texte: `${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

Ton classeur pour « ${tp} » est enregistré.

${note === null ? "Ta note arrivera dès que le corrigé sera en ligne." : `Note machine : ${String(note).replace(".", ",")} / 20.`}

${restant > 0 ? `Il te reste ${restant} copie(s) à corriger avant de voir la note de tes pairs.` : "Tu as rendu toutes tes corrections : la note de tes pairs est visible."}

${lien}

Eurêka Services — Oscar Aksanti`,
  });
}

/* ── Relance : des corrections restent à rendre ──────────────────── */

export async function courrielRelanceCorrections(opts: {
  a: string;
  prenom: string;
  restant: number;
}) {
  const { prenom, restant } = opts;
  const lien = `${SITE}/corrections`;

  return envoyer({
    a: opts.a,
    sujet: `Il te reste ${restant} copie${restant > 1 ? "s" : ""} à corriger`,
    titre: `${restant} copie${restant > 1 ? "s" : ""} t'attend${restant > 1 ? "ent" : ""}`,
    corps: [
      P(prenom ? `Bonjour ${echapper(prenom)},` : "Bonjour,"),
      P(`Ta copie est déposée, mais <b style="color:#0b0e13;">${restant} correction${restant > 1 ? "s" : ""}</b> te sépare${restant > 1 ? "nt" : ""} encore de ta note.`),
      P("C'est aussi la partie la plus instructive : en voyant comment d'autres ont traité le même problème, on repère des méthodes auxquelles on n'aurait jamais pensé seul."),
      P("Compte dix minutes par copie."),
    ].join(""),
    bouton: { texte: "Corriger maintenant", lien },
    texte: `${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

Ta copie est déposée, mais ${restant} correction(s) te sépare(nt) encore de ta note.

C'est aussi la partie la plus instructive : en voyant comment d'autres ont traité le même problème, on repère des méthodes auxquelles on n'aurait jamais pensé seul. Compte dix minutes par copie.

${lien}

Eurêka Services — Oscar Aksanti`,
  });
}

/* ── Un certificat vient d'être délivré ──────────────────────────── */

export async function courrielCertificat(opts: {
  a: string;
  prenom: string;
  code: string;
  mention: string;
}) {
  const { prenom, code, mention } = opts;
  const lien = `${SITE}/c/${code}`;

  return envoyer({
    a: opts.a,
    sujet: "Ton certificat est délivré",
    titre: "Ton certificat est là",
    corps: [
      P(prenom ? `Bonjour ${echapper(prenom)},` : "Bonjour,"),
      P(`Tu as rempli les trois conditions — tous les travaux rendus, toutes les corrections faites, et la moyenne. Ton certificat <b style="color:#0b0e13;">${echapper(mention)}</b> est établi à ton nom.`),
      P(`Son code est <b style="color:#0b0e13;font-family:'Courier New',monospace;">${echapper(code)}</b>. La page ci-dessous fait foi : n'importe qui peut y vérifier son authenticité, et tu peux l'imprimer ou l'enregistrer en PDF depuis ton navigateur.`),
      P("Partage-le sur LinkedIn si le cœur t'en dit — le bouton est sur la page."),
    ].join(""),
    bouton: { texte: "Voir mon certificat", lien },
    texte: `${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

Tu as rempli les trois conditions. Ton certificat « ${mention} » est établi à ton nom.

Code : ${code}
Page officielle : ${lien}

Cette page fait foi : n'importe qui peut y vérifier l'authenticité de ton certificat. Tu peux l'imprimer ou l'enregistrer en PDF depuis ton navigateur.

Eurêka Services — Oscar Aksanti`,
  });
}

/* ── Le fil de discussion ────────────────────────────────────────── */

/** Quelqu'un a répondu à ta question. */
export async function courrielReponseAuFil(opts: {
  a: string;
  prenom: string;
  auteurReponse: string;
  lecon: string;
  extrait: string;
  lien: string;
}) {
  const { prenom, auteurReponse, lecon, extrait, lien } = opts;
  const salut = prenom ? `Bonjour ${echapper(prenom)},` : "Bonjour,";

  return envoyer({
    a: opts.a,
    sujet: `${auteurReponse} a répondu à ta question`,
    titre: "Une réponse t'attend",
    corps: [
      P(salut),
      P(
        `<b style="color:#0b0e13;">${echapper(auteurReponse)}</b> a répondu à ta question sur `
        + `<b style="color:#0b0e13;">${echapper(lecon)}</b>.`,
      ),
      `<p style="margin:0 0 16px 0;padding:12px 16px;border-left:3px solid #c8f04b;background:#f7f9fa;font-size:14px;line-height:1.6;color:#57616d;font-style:italic;">${echapper(extrait)}</p>`,
      P(
        "Si elle règle ton problème, marque-la comme la bonne réponse : "
        + "la prochaine personne qui butera dessus la trouvera tout de suite.",
      ),
    ].join(""),
    bouton: { texte: "Lire la réponse", lien },
    texte: `${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

${auteurReponse} a répondu à ta question sur « ${lecon} ».

« ${extrait} »

Si elle règle ton problème, marque-la comme la bonne réponse.

${lien}

Eurêka Services — Oscar Aksanti`,
  });
}

/** Une question vient d'être posée — pour l'instructeur. */
export async function courrielNouvelleQuestion(opts: {
  a: string;
  auteur: string;
  lecon: string;
  extrait: string;
  lien: string;
}) {
  const { auteur, lecon, extrait, lien } = opts;

  return envoyer({
    a: opts.a,
    sujet: `Nouvelle question — ${lecon}`,
    titre: "Une question vient d'arriver",
    corps: [
      P(`<b style="color:#0b0e13;">${echapper(auteur)}</b> a posé une question sur <b style="color:#0b0e13;">${echapper(lecon)}</b>.`),
      `<p style="margin:0 0 16px 0;padding:12px 16px;border-left:3px solid #c8f04b;background:#f7f9fa;font-size:14px;line-height:1.6;color:#57616d;font-style:italic;">${echapper(extrait)}</p>`,
      P("Une question répondue dans la journée fait un forum vivant. Répondue au bout de trois jours, elle n'en fait plus."),
    ].join(""),
    bouton: { texte: "Répondre", lien },
    texte: `${auteur} a posé une question sur « ${lecon} ».

« ${extrait} »

${lien}`,
  });
}

/* ── Un paiement vient d'aboutir ─────────────────────────────────── */

/**
 * Ce qui s'ouvre, selon ce qui a été acheté.
 *
 * Écrit produit par produit plutôt qu'en une phrase passe-partout :
 * quelqu'un qui vient de payer veut savoir exactement ce qu'il a, et
 * une formule vague au moment du paiement est ce qui fabrique les
 * demandes de remboursement.
 */
const CE_QUI_OUVRE: Record<string, { ouvre: string[]; certificat: boolean }> = {
  masterclass37: {
    ouvre: [
      "Les onze modules et leurs cinquante-cinq leçons, du premier au dernier.",
      "Les onze travaux pratiques, corrigés par la machine en quelques secondes.",
      "Le projet final et la correction entre pairs.",
      "L'accès à vie, et toutes les vidéos à mesure qu'elles sortent.",
    ],
    certificat: true,
  },
  coaching97: {
    ouvre: [
      "Les onze modules et leurs cinquante-cinq leçons, du premier au dernier.",
      "Les onze travaux pratiques, corrigés par la machine en quelques secondes.",
      "Le projet final et la correction entre pairs.",
      "Les quatre séances du cercle, en direct, et le canal privé où Oscar répond.",
      "L'accès à vie, et toutes les vidéos à mesure qu'elles sortent.",
    ],
    certificat: true,
  },
  equipe: {
    ouvre: [
      "Les onze modules et leurs cinquante-cinq leçons, pour cinq personnes.",
      "Les onze travaux pratiques et le projet final.",
      "Une séance dédiée, sur vos fichiers.",
    ],
    certificat: true,
  },
  certificat27: {
    ouvre: [
      "La validation des modules 0 à 3 et de leurs travaux pratiques.",
      "Ton certificat Fondations, vérifiable publiquement.",
    ],
    certificat: false,
  },
};

const LISTE = (items: string[]) =>
  `<ul style="margin:0 0 18px 0;padding:0 0 0 18px;font-size:15px;line-height:1.7;color:#57616d;">`
  + items.map((t) => `<li style="margin:0 0 6px 0;">${echapper(t)}</li>`).join("")
  + `</ul>`;

export async function courrielAchat(opts: {
  a: string;
  prenom: string;
  produit: string;
  offre: string;
  montant: string;
  reference: string;
  ouvert: boolean;
  lien: string;
}) {
  const { prenom, produit, offre, montant, reference, ouvert, lien } = opts;
  const salut = prenom ? `Bonjour ${echapper(prenom)},` : "Bonjour,";
  const contenu = CE_QUI_OUVRE[produit] ?? CE_QUI_OUVRE.masterclass37;

  //  Deux situations à distinguer franchement : soit le compte existe
  //  et tout est déjà déverrouillé, soit la personne a payé avant de
  //  s'inscrire — auquel cas elle doit savoir que son accès s'ouvrira
  //  avec CETTE adresse, et pas une autre.
  const acces = ouvert
    ? P("<b style=\"color:#0b0e13;\">Ton accès est déjà ouvert.</b> Connecte-toi, tout est déverrouillé.")
    : P(
        "Il ne te reste qu'une chose à faire : entrer sur la plateforme avec "
        + "<b style=\"color:#0b0e13;\">cette adresse</b>. Ton accès s'ouvrira tout seul "
        + "à ta première connexion — avec une autre adresse, il ne se trouvera pas.",
      );

  const leCertificat = contenu.certificat
    ? [
        `<p style="margin:0 0 10px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#57616d;">Le certificat</p>`,
        P(
          "Il ne s'achète pas : <b style=\"color:#0b0e13;\">il se mérite</b>. "
          + "Trois conditions, les mêmes pour tout le monde — tous les travaux "
          + "pratiques rendus, toutes les corrections de tes pairs effectuées, et "
          + "une moyenne d'au moins <b style=\"color:#0b0e13;\">12 sur 20</b>.",
        ),
        P(
          "Il porte un code unique et une page de vérification publique : "
          + "quiconque le reçoit confirme en trois secondes qu'il est réel.",
        ),
      ].join("")
    : "";

  const texteCertificat = contenu.certificat
    ? `\nLE CERTIFICAT\nIl ne s'achete pas, il se merite. Trois conditions : tous les travaux pratiques rendus, toutes les corrections de tes pairs effectuees, et une moyenne d'au moins 12 sur 20. Il porte un code unique et une page de verification publique.\n`
    : "";

  return envoyer({
    a: opts.a,
    sujet: `C'est réglé — ${offre}`,
    titre: "Paiement reçu",
    corps: [
      P(salut),
      P(`Ton paiement de <b style="color:#0b0e13;">${echapper(montant)}</b> pour <b style="color:#0b0e13;">${echapper(offre)}</b> est bien arrivé.`),
      acces,
      `<p style="margin:0 0 10px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#57616d;">Ce qui est à toi</p>`,
      LISTE(contenu.ouvre),
      leCertificat,
      `<p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#8a96a4;">Référence : <span style="font-family:'Courier New',monospace;">${echapper(reference)}</span> — garde-la, c'est elle qui permet de retrouver ton paiement si quelque chose coince.</p>`,
    ].join(""),
    bouton: { texte: ouvert ? "Reprendre la formation" : "Entrer sur la plateforme", lien },
    texte: `${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

Ton paiement de ${montant} pour « ${offre} » est bien arrive.

${ouvert
  ? "Ton acces est deja ouvert. Connecte-toi, tout est deverrouille."
  : "Il ne te reste qu'a entrer sur la plateforme avec CETTE adresse : ton acces s'ouvrira tout seul a ta premiere connexion. Avec une autre, il ne se trouvera pas."}

CE QUI EST A TOI
${contenu.ouvre.map((t) => `- ${t}`).join("\n")}
${texteCertificat}
Reference : ${reference}

${lien}

Eureka Services — Oscar Aksanti`,
  });
}
