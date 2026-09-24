"use client";

/* ══════════════════════════════════════════════════════════════════
   « Télécharger en PDF ».

   Pas de bibliothèque, pas de rendu serveur : la feuille de style
   d'impression dessine déjà le certificat en A4 paysage, au pixel
   près, avec le QR et le cachet. Le navigateur sait en faire un PDF —
   « Enregistrer au format PDF » sur ordinateur comme sur Android.

   Le seul vrai manque, c'était le nom du fichier : le navigateur le
   prend dans le titre du document, et « Certificat de X · Excelerate
   IA » donnait un fichier à rallonge. On le remplace le temps de
   l'impression, puis on le remet.
   ══════════════════════════════════════════════════════════════════ */

function nomDeFichier(nom: string, code: string) {
  const propre = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `Certificat-${propre || "Excelerate"}-${code}`;
}

export function TelechargerPdf({ nom, code }: { nom: string; code: string }) {
  function telecharger() {
    const avant = document.title;
    document.title = nomDeFichier(nom, code);

    const remettre = () => {
      document.title = avant;
      window.removeEventListener("afterprint", remettre);
    };
    window.addEventListener("afterprint", remettre);

    //  Safari sur iPhone ne déclenche pas toujours « afterprint » :
    //  sans ce filet, l'onglet garderait le titre du fichier.
    window.setTimeout(remettre, 10000);

    window.print();
  }

  return (
    <button type="button" onClick={telecharger} className="bouton">
      Télécharger en PDF
    </button>
  );
}
