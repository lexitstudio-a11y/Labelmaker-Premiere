# Label Maker — extension Premiere Pro

Extension CEP pour Premiere Pro qui applique automatiquement un label de
couleur different a chaque element selectionne dans la timeline, dans
l'ordre du montage (bouton **Croissant** 🥐).

## Fonctionnement

1. Selectionnez des clips dans la timeline (ils peuvent etre sur des
   pistes video et/ou audio differentes).
2. Ouvrez le panneau **Label Maker** (`Fenetre > Extensions > Label
   Maker`) et cliquez sur **Croissant**.
3. Chaque clip selectionne recoit une couleur de label differente, dans
   l'ordre des 16 couleurs par defaut de Premiere :

   `Violet, Iris, Caraibe, Lavande, Ceruleen, Foret, Rose, Mangue,
   Pourpre, Bleu, Bleu-vert, Magenta, Brun roux, Vert, Marron, Jaune`

   - L'ordre suit la position des clips sur la timeline : le clip qui
     commence le plus tot recoit la premiere couleur (Violet), puis les
     suivants dans l'ordre chronologique.
   - Si plusieurs clips selectionnes commencent exactement au meme
     instant sur des pistes differentes, celui qui est visuellement le
     plus bas dans la timeline recoit sa couleur en premier (sans faire
     recommencer le cycle de couleurs), puis celui juste au-dessus, etc.
   - Au-dela de 16 clips selectionnes, le cycle de couleurs repart a
     Violet.

## Installation (mode debug, extension non signee)

Cette extension n'est pas publiee sur Adobe Exchange : elle doit etre
chargee en mode debug.

### 1. Activer le mode debug CEP

**Windows** — ouvrir une invite de commandes et executer, pour chaque
version de CEP concernee (adapter le numero si besoin, ex. `CSXS.9`,
`CSXS.10`, `CSXS.11`) :

```
reg add HKEY_CURRENT_USER\Software\Adobe\CSXS.9 /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add HKEY_CURRENT_USER\Software\Adobe\CSXS.10 /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add HKEY_CURRENT_USER\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
```

**macOS** — dans le Terminal :

```
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

> Astuce : si vous ne connaissez pas la version de CEP utilisee par
> votre Premiere Pro, activez les cles CSXS.9 a CSXS.12, cela ne pose
> aucun probleme.

### 2. Copier l'extension dans le dossier CEP

Copiez le dossier `com.lexitstudio.labelmaker` (avec son contenu :
`CSXS/`, `client/`, `host/`, `.debug`) dans le dossier des extensions
CEP :

- **Windows** : `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
- **macOS** : `/Library/Application Support/Adobe/CEP/extensions/`

(Creez le dossier `extensions` s'il n'existe pas encore.)

### 3. Redemarrer Premiere Pro

Relancez Premiere Pro, puis ouvrez le panneau via
`Fenetre > Extensions > Label Maker`.

## Details techniques

- L'API scriptable documentee de Premiere Pro (`TrackItem`) ne permet
  pas de definir la couleur de label d'un clip. L'extension utilise
  donc le DOM **QE** (`app.enableQE()` / objet global `qe`), la methode
  standard employee par la communaute des scripteurs Premiere pour
  cette fonctionnalite (`qeTrackItem.setColorAsLabel(index)`).
- La selection des clips est lue via `qeTrackItem.isSelected()`, en
  alignant les index avec la collection documentee `track.clips` pour
  recuperer un temps de depart fiable (`trackItem.start.seconds`) et
  trier les clips.
- Cette approche s'appuyant sur une API non documentee, son
  comportement peut varier legerement selon les versions de Premiere
  Pro. Testez dans votre version avant un usage en production.
