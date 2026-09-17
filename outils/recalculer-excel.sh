#!/bin/bash
# Recalcule un classeur avec le VRAI Excel, et l'enregistre en place.
#
# LibreOffice suffit pour presque tout, mais pas pour tout : CAR(160),
# les comparaisons de casse et quelques fonctions récentes divergent.
# Le correcteur compare des valeurs mises en cache — elles doivent être
# celles qu'Excel produira chez l'apprenant, pas celles d'un autre moteur.
#
#   outils/recalculer-excel.sh chemin/vers/CORRIGE.xlsx
set -e
F="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
osascript <<AS
tell application "Microsoft Excel"
    activate
    open POSIX file "$F"
    delay 2
    calculate
    delay 1
    save active workbook
    close active workbook saving no
end tell
AS
echo "recalculé par Excel : $(basename "$F")"
