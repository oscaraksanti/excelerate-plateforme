import { redirect } from "next/navigation";

/**
 * Le profil a fusionné avec « Mon parcours ».
 *
 * Deux pages qui disent la même chose autrement, c'est une de trop :
 * on ne savait plus laquelle ouvrir pour corriger son nom. Les liens
 * déjà envoyés par courriel pointent ici, donc la route reste.
 */
export default function PageProfil() {
  redirect("/mon-parcours");
}
