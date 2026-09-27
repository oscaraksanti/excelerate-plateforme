import Image from "next/image";

/* ══════════════════════════════════════════════════════════════════
   Le visage de quelqu'un, ou ses initiales à défaut.

   Les initiales ne sont pas un pis-aller honteux : sur une plateforme
   où beaucoup n'ont pas encore mis de photo, deux lettres bien posées
   valent mieux qu'une silhouette grise identique pour tous.
   ══════════════════════════════════════════════════════════════════ */

const RACINE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/avatars/`;

export function adresseAvatar(chemin: string | null | undefined) {
  return chemin ? `${RACINE}${chemin}` : null;
}

function initiales(nom: string) {
  const mots = (nom ?? "").trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return "?";
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();
  return (mots[0][0] + mots[mots.length - 1][0]).toUpperCase();
}

export function Avatar({
  nom,
  avatar,
  taille = 40,
  className = "",
}: {
  nom: string;
  avatar?: string | null;
  taille?: number;
  className?: string;
}) {
  const url = adresseAvatar(avatar);
  const style = { width: taille, height: taille };

  if (url) {
    return (
      <Image
        src={url}
        alt={nom || "Photo de profil"}
        width={taille * 2}
        height={taille * 2}
        style={style}
        unoptimized
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: Math.round(taille * 0.38) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-fond-3 font-mono font-semibold tracking-[0.02em] text-texte-2 ${className}`}
    >
      {initiales(nom)}
    </span>
  );
}
