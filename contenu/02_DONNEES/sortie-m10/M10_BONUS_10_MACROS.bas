Attribute VB_Name = "BAOBAB_Outils"
'==================================================================
' 🎁 BONUS NIVEAU + — les dix macros à mettre dans PERSONAL.XLSB
'
' PERSONAL.XLSB est un classeur invisible qu'Excel ouvre à chaque
' démarrage. Les macros qui y vivent sont disponibles dans TOUS vos
' fichiers, pour toujours. Presque personne ne sait qu'il existe.
'
' COMMENT LE CRÉER, en une fois :
'   1. Onglet Développeur > Enregistrer une macro
'   2. « Enregistrer dans » : Classeur de macros personnelles
'   3. Faire n'importe quoi (cliquer une cellule), arrêter
'   4. Fermer Excel, répondre OUI à « enregistrer PERSONAL.XLSB »
'   PERSONAL.XLSB existe. Il ne reste qu'à y importer ce fichier :
'   Éditeur VBA > clic droit sur VBAProject(PERSONAL.XLSB) > Importer.
'
' ⚠️ Sur Mac, PERSONAL.XLSB vit dans
'    ~/Library/Group Containers/UBF8T346G9.Office/User Content/
'    Startup/Excel/ — le dossier se crée tout seul à l'étape 4.
'
' Chaque macro travaille sur la SÉLECTION ou sur le classeur ACTIF,
' jamais sur ThisWorkbook : ThisWorkbook serait PERSONAL.XLSB lui-même.
'==================================================================
Option Explicit

'--- 1 --------------------------------------------------------------
Sub B01_SupprimerLignesVides()
' Supprime les lignes entièrement vides de la plage utilisée.
' On remonte : supprimer une ligne décale tout ce qui est en dessous.

    Dim i As Long, derniere As Long, n As Long
    Application.ScreenUpdating = False
    derniere = ActiveSheet.UsedRange.Rows(ActiveSheet.UsedRange.Rows.Count).Row

    For i = derniere To 1 Step -1
        If Application.WorksheetFunction.CountA(Rows(i)) = 0 Then
            Rows(i).Delete
            n = n + 1
        End If
    Next i

    Application.ScreenUpdating = True
    MsgBox n & " ligne(s) vide(s) supprimée(s)."
End Sub

'--- 2 --------------------------------------------------------------
Sub B02_FormulesEnValeurs()
' Transforme les formules de la sélection en valeurs figées.
' Le geste qu'on fait avant d'envoyer un extrait à quelqu'un
' qui n'aura jamais les données sources.

    If TypeName(Selection) <> "Range" Then Exit Sub
    Selection.Value = Selection.Value
    ' Une seule ligne : lire la valeur d'une plage et la réécrire
    ' dans la même plage remplace la formule par son résultat.
End Sub

'--- 3 --------------------------------------------------------------
Sub B03_NettoyerEspaces()
' Retire les espaces insécables (CAR 160) et les espaces en trop.
' CAR(160) est le cadeau des copier-coller depuis un site web :
' invisible, et il fait échouer tous les RECHERCHEX.

    Dim c As Range, n As Long
    If TypeName(Selection) <> "Range" Then Exit Sub
    Application.ScreenUpdating = False

    For Each c In Selection
        If VarType(c.Value) = vbString Then
            Dim avant As String
            avant = c.Value
            c.Value = Application.WorksheetFunction.Trim( _
                      Replace(c.Value, Chr(160), " "))
            If c.Value <> avant Then n = n + 1
        End If
    Next c

    Application.ScreenUpdating = True
    MsgBox n & " cellule(s) nettoyée(s)."
End Sub

'--- 4 --------------------------------------------------------------
Sub B04_ExporterFeuilleEnPDF()
' Exporte la feuille active en PDF, nommé « classeur_feuille_date ».
' Dans le dossier du classeur actif.

    Dim sep As String, chemin As String
    sep = Application.PathSeparator

    If ActiveWorkbook.Path = "" Then
        MsgBox "Enregistrez d'abord le classeur quelque part.", vbExclamation
        Exit Sub
    End If

    chemin = ActiveWorkbook.Path & sep & _
             Replace(ActiveWorkbook.Name, ".xlsx", "") & "_" & _
             ActiveSheet.Name & "_" & Format(Date, "yyyy-mm-dd") & ".pdf"

    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=chemin, _
        OpenAfterPublish:=False
    MsgBox "Écrit : " & chemin
End Sub

'--- 5 --------------------------------------------------------------
Sub B05_DegrouperToutesLesFeuilles()
' Annule un groupement de feuilles oublié.
' Le groupement est invisible sauf à la barre de titre — et tout ce
' qu'on tape s'écrit alors sur TOUTES les feuilles groupées.

    If ActiveWorkbook.Windows(1).SelectedSheets.Count > 1 Then
        ActiveSheet.Select Replace:=True
        MsgBox "Feuilles dégroupées."
    Else
        MsgBox "Aucun groupement en cours."
    End If
End Sub

'--- 6 --------------------------------------------------------------
Sub B06_AfficherToutesLesFeuilles()
' Rend visibles toutes les feuilles, y compris les « très masquées »
' que le menu Afficher ne propose pas.

    Dim f As Object, n As Long
    For Each f In ActiveWorkbook.Sheets
        If f.Visible <> xlSheetVisible Then
            f.Visible = xlSheetVisible
            n = n + 1
        End If
    Next f
    MsgBox n & " feuille(s) rendue(s) visible(s)."
End Sub

'--- 7 --------------------------------------------------------------
Sub B07_SupprimerNomsOrphelins()
' Supprime les plages nommées cassées (#REF!).
' Elles polluent l'autocomplétion et se propagent à chaque copie
' de feuille vers un autre classeur.

    Dim nm As Name, n As Long
    For Each nm In ActiveWorkbook.Names
        If InStr(1, nm.RefersTo, "#REF!") > 0 Then
            nm.Delete
            n = n + 1
        End If
    Next nm
    MsgBox n & " nom(s) orphelin(s) supprimé(s)."
End Sub

'--- 8 --------------------------------------------------------------
Sub B08_RompreLiensExternes()
' Remplace tous les liens vers d'autres classeurs par leurs valeurs.
' 🔴 IRRÉVERSIBLE : on demande confirmation, et on n'y touche pas
'    sans avoir une copie du fichier.

    Dim liens As Variant, k As Long

    liens = ActiveWorkbook.LinkSources(xlExcelLinks)
    If IsEmpty(liens) Then
        MsgBox "Aucun lien externe. C'est une bonne nouvelle."
        Exit Sub
    End If

    If MsgBox(UBound(liens) & " lien(s) externe(s) vont être remplacés " & _
              "par leurs valeurs. C'est irréversible. Continuer ?", _
              vbYesNo + vbExclamation) <> vbYes Then Exit Sub

    For k = 1 To UBound(liens)
        ActiveWorkbook.BreakLink Name:=liens(k), Type:=xlLinkTypeExcelLinks
    Next k
    MsgBox "Terminé."
End Sub

'--- 9 --------------------------------------------------------------
Sub B09_AjusterToutesLesColonnes()
' Ajuste la largeur des colonnes de TOUTES les feuilles, et repose
' le curseur en A1 de la première. Le geste d'avant-livraison.

    Dim f As Worksheet
    Application.ScreenUpdating = False
    For Each f In ActiveWorkbook.Worksheets
        f.Cells.EntireColumn.AutoFit
    Next f
    ActiveWorkbook.Worksheets(1).Activate
    ActiveWorkbook.Worksheets(1).Range("A1").Select
    Application.ScreenUpdating = True
End Sub

'--- 10 -------------------------------------------------------------
Sub B10_PoserLeTotalDeControle()
' Pose, sous la sélection, la somme ET le nombre de valeurs — puis
' l'écart avec ce qui est affiché dans la barre d'état.
' C'est le geste du module 2, rendu instantané.

    Dim p As Range, cible As Range
    If TypeName(Selection) <> "Range" Then Exit Sub
    Set p = Selection
    Set cible = p.Cells(p.Rows.Count, 1).Offset(2, 0)

    cible.Value = "Total de contrôle"
    cible.Offset(0, 1).Formula = "=SUM(" & p.Address & ")"
    cible.Offset(1, 0).Value = "Valeurs numériques"
    cible.Offset(1, 1).Formula = "=COUNT(" & p.Address & ")"
    cible.Offset(2, 0).Value = "Cellules non vides"
    cible.Offset(2, 1).Formula = "=COUNTA(" & p.Address & ")"
    cible.Resize(3, 1).Font.Bold = True

    ' Si « Valeurs numériques » et « Cellules non vides » diffèrent,
    ' des nombres sont stockés en texte. C'est tout l'intérêt.
End Sub

'==================================================================
