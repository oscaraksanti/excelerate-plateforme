Attribute VB_Name = "M10_Exemples"
'==================================================================
' MODULE 10 · leçon 10.2 — lire, corriger et déclencher du code
'
' Six exemples courts, commentés ligne par ligne. Ils ne font pas le
' TP à votre place : ils vous donnent les cinq gestes dont il est fait.
'
' À importer : Outils > Macro > Éditeur Visual Basic, puis
' clic droit sur le projet > Importer un fichier.
'
' ⚠️ Écrit pour Excel Windows ET Excel pour Mac. Les différences sont
'    signalées par un bloc #If Mac Then, et elles sont réelles :
'    FileSystemObject et FileDialog n'existent pas sur Mac.
'==================================================================
Option Explicit          ' oblige à déclarer chaque variable — attrape
                         ' la faute de frappe dans un nom, qui sinon
                         ' crée silencieusement une variable vide

'------------------------------------------------------------------
' 1 · La ligne qui rend une macro dix fois plus rapide
'------------------------------------------------------------------
Sub Exemple01_Vitesse()

    Dim t As Double                      ' pour mesurer la durée
    t = Timer                            ' Timer = secondes depuis minuit

    Application.ScreenUpdating = False   ' Excel arrête de redessiner
    Application.Calculation = xlCalculationManual  ' et de recalculer
    Application.EnableEvents = False     ' et d'exécuter les événements

    Dim i As Long                        ' Long, pas Integer : Integer
                                         ' s'arrête à 32 767
    For i = 1 To 20000
        Cells(i, 20).Value = i * 2       ' un travail idiot, pour l'exemple
    Next i

    Application.EnableEvents = True      ' on remet TOUT dans l'ordre
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True    ' inverse de l'ordre d'extinction

    MsgBox "Terminé en " & Format(Timer - t, "0.00") & " secondes."

    Columns(20).ClearContents            ' on nettoie derrière soi

End Sub
' 🔴 Si la macro plante AVANT de remettre ScreenUpdating à True, Excel
'    reste figé. C'est pour ça que l'exemple 4 met la remise en état
'    dans un bloc d'erreur, et pas à la fin.

'------------------------------------------------------------------
' 2 · Boucler sur les feuilles — le « For Each » à connaître
'------------------------------------------------------------------
Sub Exemple02_BouclerSurLesFeuilles()

    Dim f As Worksheet                   ' f désignera tour à tour
                                         ' chaque feuille du classeur
    Dim compte As Long

    For Each f In ThisWorkbook.Worksheets
        ' ThisWorkbook = le classeur QUI CONTIENT la macro.
        ' ActiveWorkbook = celui qui est devant. Ce n'est pas pareil,
        ' et c'est la cause n° 1 des macros qui écrivent au mauvais
        ' endroit.

        If Left(f.Name, 1) <> "_" Then   ' on saute les feuilles
                                         ' techniques, nommées _quelque
            f.Range("A1").Font.Bold = True
            compte = compte + 1
        End If
    Next f

    MsgBox compte & " feuille(s) traitée(s)."

End Sub

'------------------------------------------------------------------
' 3 · Exporter UNE feuille en PDF, avec un nom calculé
'------------------------------------------------------------------
Sub Exemple03_ExporterEnPDF()

    Dim fs As Worksheet
    Dim dossier As String
    Dim chemin As String
    Dim sep As String

    Set fs = ThisWorkbook.Worksheets(1)  ' la première feuille

    sep = Application.PathSeparator       ' "\" sur Windows, "/" sur Mac
                                          ' — ne jamais écrire l'un des
                                          ' deux en dur

    dossier = ThisWorkbook.Path & sep & "Rapports"
    ' Un sous-dossier du dossier du classeur. JAMAIS un chemin absolu
    ' du genre C:\Users\vous\Bureau : il n'existera chez personne d'autre.

    If Dir(dossier, vbDirectory) = "" Then
        ' Dir() rend une chaîne vide si le dossier n'existe pas.
        ' On ne se sert PAS de FileSystemObject : il n'existe pas sur Mac.
        MkDir dossier
    End If

    chemin = dossier & sep & Format(Date, "yyyy-mm") & "_" & _
             NomDeFichierPropre(fs.Name) & ".pdf"

    fs.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=chemin, _
        Quality:=xlQualityStandard, _
        IncludeDocProperties:=False, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=False      ' surtout pas True dans une boucle :
                                     ' douze lecteurs PDF s'ouvriraient

    MsgBox "Écrit : " & chemin

End Sub

'------------------------------------------------------------------
' 3bis · Rendre un nom de fichier utilisable partout
'------------------------------------------------------------------
Function NomDeFichierPropre(ByVal t As String) As String

    Dim interdits As Variant
    Dim k As Long

    ' Les caractères que Windows refuse dans un nom de fichier, plus
    ' l'apostrophe et les accents, qui survivent mal aux messageries.
    interdits = Array("\", "/", ":", "*", "?", """", "<", ">", "|", _
                      " ", "'", "’", ",", ";")

    For k = LBound(interdits) To UBound(interdits)
        t = Replace(t, interdits(k), "_")
    Next k

    ' Les accents, un par un. Laid, mais sans dépendance.
    t = Replace(Replace(Replace(t, "é", "e"), "è", "e"), "ê", "e")
    t = Replace(Replace(Replace(t, "à", "a"), "â", "a"), "ô", "o")
    t = Replace(Replace(Replace(t, "î", "i"), "ï", "i"), "ç", "c")
    t = Replace(Replace(t, "û", "u"), "ù", "u")

    Do While InStr(t, "__") > 0           ' pas de double soulignement
        t = Replace(t, "__", "_")
    Loop

    NomDeFichierPropre = t

End Function

'------------------------------------------------------------------
' 4 · La gestion d'erreur, et pourquoi elle est au début
'------------------------------------------------------------------
Sub Exemple04_AvecGestionErreur()

    On Error GoTo Rate                    ' dès la première ligne utile :
                                          ' tout ce qui suit est couvert

    Application.ScreenUpdating = False

    Dim x As Double
    x = 1 / 0                             ' l'erreur, volontaire

    GoTo Fin                              ' le chemin normal saute le
                                          ' bloc d'erreur

Rate:
    MsgBox "Ça s'est mal passé." & vbNewLine & vbNewLine & _
           "Erreur " & Err.Number & " : " & Err.Description, vbExclamation
    ' On NOMME l'erreur. « Une erreur est survenue » n'aide personne,
    ' et surtout pas vous, dans six mois.

Fin:
    Application.ScreenUpdating = True     ' remis dans les DEUX chemins
    Application.Calculation = xlCalculationAutomatic

End Sub

'------------------------------------------------------------------
' 5 · 🔴 L'erreur que l'IA écrit presque toujours
'------------------------------------------------------------------
Sub Exemple05_CeQuIlNeFautPasFaire()

    Dim i As Long

    ' ❌ FAUX. Supprimer en DESCENDANT : quand la ligne 7 part, l'ancienne
    '    ligne 8 devient la 7 — et la boucle passe à 8, qui est l'ancienne
    '    9. Une ligne vide sur deux survit, et personne ne le voit sur un
    '    jeu de test de trois lignes.
    For i = 1 To 100
        If Cells(i, 1).Value = "" Then Rows(i).Delete
    Next i

End Sub

Sub Exemple05bis_LaCorrection()

    Dim i As Long

    ' ✅ JUSTE. On remonte : supprimer la ligne 60 ne déplace aucune
    '    ligne au-dessus d'elle. Step -1 est toute la correction.
    For i = 100 To 1 Step -1
        If Cells(i, 1).Value = "" Then Rows(i).Delete
    Next i

End Sub

'------------------------------------------------------------------
' 6 · Les deux événements qui servent vraiment
'------------------------------------------------------------------
' ⚠️ Ceux-ci ne vont PAS dans un module standard.
'    Workbook_Open va dans l'objet « ThisWorkbook ».
'    Worksheet_Change va dans l'objet de la feuille concernée.
'    Collés ici, ils ne se déclencheront jamais.
'------------------------------------------------------------------
'
'   Private Sub Workbook_Open()
'       ' Actualise tout à l'ouverture : le fichier est à jour avant
'       ' même qu'on le regarde.
'       ThisWorkbook.RefreshAll
'       ThisWorkbook.Worksheets("DASHBOARD").Activate
'       ThisWorkbook.Worksheets("DASHBOARD").Range("A1").Select
'   End Sub
'
'   Private Sub Worksheet_Change(ByVal Target As Range)
'       ' Ne réagit QUE si la cellule modifiée est dans la zone visée.
'       If Intersect(Target, Me.Range("B4:B18")) Is Nothing Then Exit Sub
'
'       Application.EnableEvents = False   ' sinon l'écriture ci-dessous
'                                          ' redéclenche l'événement,
'                                          ' à l'infini
'       Me.Range("D1").Value = Now
'       Application.EnableEvents = True
'   End Sub
'
'==================================================================
