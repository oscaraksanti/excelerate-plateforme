#!/usr/bin/env python3
"""
Consolide les 200 classeurs clients de BAOBAB — août 2026.

C'est le script que Claude Code écrit à partir du CLAUDE.md et de la
Skill. Il est publié ici pour une seule raison : vous devez pouvoir
le LIRE. On ne déploie jamais ce qu'on ne comprend pas, et ça vaut
autant pour un script que pour une macro.

    python3 M10_L05_CONSOLIDER.py J10_Clients/

Il ne modifie aucun fichier source. Il écrit deux CSV à côté.
"""
import csv, pathlib, sys
from openpyxl import load_workbook

DOSSIER = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "J10_Clients")

#  Les taux du mois, figés. Ils ne sont pas devinés : ils viennent du
#  CLAUDE.md, qui les tient d'une source citée.
TAUX = {"CDF": 3145.80, "XOF": 648.20, "XAF": 648.20}

#  Les colonnes qu'on attend. Trois fichiers en ont une de plus
#  (Remise_Pct) : on lit par NOM de colonne, jamais par position.
#  C'est ce qui rend le script insensible à l'ordre.
ATTENDUES = ["Date", "Reference", "Produit", "Famille",
             "Quantite", "PU_Local", "Montant_Local"]


def feuille_commandes(wb):
    """Trouve la feuille des commandes, quelle que soit sa casse.

    Deux fichiers sur deux cents la nomment COMMANDES. Un script qui
    écrit wb["Commandes"] plante sur ceux-là — et plante à la 34ᵉ
    itération, c'est-à-dire assez tard pour qu'on croie le reste bon.
    """
    for nom in wb.sheetnames:
        if nom.strip().lower() == "commandes":
            return wb[nom]
    return None


def lire_entetes(ws):
    """L'en-tête est en ligne 5 : trois lignes de titre au-dessus.

    On rend un dictionnaire nom → index de colonne, pour lire par nom.
    """
    entetes = {}
    for c in ws[5]:
        if c.value:
            entetes[str(c.value).strip()] = c.column
    return entetes


def lire_fichier(chemin):
    """Rend (méta, lignes). Ne lève jamais : un fichier illisible est
    signalé, pas fatal. Deux cents fichiers, c'est deux cents occasions
    de s'arrêter au mauvais moment."""
    meta = {"fichier": chemin.name, "lignes": 0, "total_local": 0.0,
            "total_usd": 0.0, "anomalie": "", "erreur": ""}
    try:
        wb = load_workbook(chemin, data_only=True, read_only=True)
    except Exception as e:
        meta["erreur"] = f"illisible : {e}"
        return meta, []

    ws = feuille_commandes(wb)
    if ws is None:
        meta["erreur"] = "aucune feuille « Commandes »"
        return meta, []
    if ws.title != "Commandes":
        meta["anomalie"] = f"feuille nommée {ws.title}"

    #  La ligne 2 porte « Code client Cxxxx · agence de X (Pays) ·
    #  montants en DEV ». On la lit plutôt que de deviner d'après le
    #  nom du fichier : le nom du fichier n'est pas une source.
    entete2 = str(ws["A2"].value or "")
    code = entete2.split("Code client")[-1].strip().split()[0] if "Code client" in entete2 else ""
    agence = entete2.split("agence de")[-1].split("(")[0].strip() if "agence de" in entete2 else ""
    devise = entete2.split("montants en")[-1].strip() if "montants en" in entete2 else ""
    meta.update(code=code, agence=agence, devise=devise,
                client=str(ws["A1"].value or "").strip())

    cols = lire_entetes(ws)
    manquantes = [c for c in ATTENDUES if c not in cols]
    if manquantes:
        meta["erreur"] = "colonnes manquantes : " + ", ".join(manquantes)
        return meta, []
    if len(cols) > len(ATTENDUES):
        sup = sorted(set(cols) - set(ATTENDUES))
        meta["anomalie"] = (meta["anomalie"] + " · " if meta["anomalie"] else "") \
            + "colonne(s) en plus : " + ", ".join(sup)

    taux = TAUX.get(devise)
    if taux is None:
        meta["erreur"] = f"devise inconnue : {devise!r}"
        return meta, []

    lignes = []
    for r in ws.iter_rows(min_row=6):
        valeurs = {nom: r[i - 1].value for nom, i in cols.items()}
        #  🔴 Six fichiers portent une ligne TOTAL sous le tableau.
        #  Elle n'a ni date ni produit. La sauter est LA raison d'être
        #  de ce test : sans lui, le consolidé compte tout deux fois
        #  pour ces six clients-là — et rien ne le signale.
        if valeurs.get("Date") is None or valeurs.get("Produit") is None:
            if any(v is not None for v in valeurs.values()):
                meta["anomalie"] = (meta["anomalie"] + " · " if meta["anomalie"]
                                    else "") + "ligne TOTAL ignorée"
            continue
        montant = float(valeurs["Montant_Local"] or 0)
        usd = round(montant / taux, 2)
        lignes.append({
            "Date": valeurs["Date"].date() if hasattr(valeurs["Date"], "date")
                    else valeurs["Date"],
            "Code_Client": code, "Client": meta["client"], "Agence": agence,
            "Famille": valeurs["Famille"], "Produit": valeurs["Produit"],
            "Quantite": valeurs["Quantite"], "PU_Local": valeurs["PU_Local"],
            "Montant_Local": montant, "Devise": devise, "Taux": taux,
            "Montant_USD": usd,
        })
    wb.close()

    meta["lignes"] = len(lignes)
    meta["total_local"] = sum(x["Montant_Local"] for x in lignes)
    #  On somme les montants DÉJÀ arrondis, ligne à ligne. Convertir le
    #  total donnerait un autre chiffre — 0,54 USD d'écart sur ce mois.
    #  Les deux sont défendables ; ce qui ne l'est pas, c'est de mélanger.
    meta["total_usd"] = round(sum(x["Montant_USD"] for x in lignes), 2)
    if not lignes and not meta["erreur"]:
        meta["anomalie"] = "fichier vide"
    return meta, lignes


def main():
    fichiers = sorted(DOSSIER.glob("*.xlsx"))
    if not fichiers:
        sys.exit(f"Aucun classeur dans {DOSSIER}/")

    metas, toutes = [], []
    for k, f in enumerate(fichiers, 1):
        meta, lignes = lire_fichier(f)
        metas.append(meta); toutes.extend(lignes)
        if k % 50 == 0:
            print(f"  {k}/{len(fichiers)}…")

    toutes.sort(key=lambda x: (x["Date"], x["Code_Client"], x["Produit"]))

    with open(DOSSIER.parent / "consolide.csv", "w", newline="",
              encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(toutes[0].keys()))
        w.writeheader(); w.writerows(toutes)

    with open(DOSSIER.parent / "recapitulatif.csv", "w", newline="",
              encoding="utf-8") as fh:
        champs = ["fichier", "code", "client", "agence", "devise", "lignes",
                  "total_local", "total_usd", "anomalie", "erreur"]
        w = csv.DictWriter(fh, fieldnames=champs, extrasaction="ignore")
        w.writeheader(); w.writerows(metas)

    total = round(sum(x["Montant_USD"] for x in toutes), 2)
    recap = round(sum(m["total_usd"] for m in metas), 2)

    print(f"\n  {len(fichiers)} fichiers · {len(toutes)} lignes")
    print(f"  total consolidé      {total:>14,.2f} USD")
    print(f"  total récapitulatif  {recap:>14,.2f} USD")
    print(f"  ÉCART                {round(total - recap, 2):>14,.2f} USD"
          "   ← doit valoir 0,00")
    print(f"  vides      {sum(1 for m in metas if m['lignes'] == 0)}")
    print(f"  anomalies  {sum(1 for m in metas if m['anomalie'])}")
    print(f"  erreurs    {sum(1 for m in metas if m['erreur'])}")


if __name__ == "__main__":
    main()
