# Font Finder – extension Chrome

Sélectionnez un texte sur n'importe quel site : une bulle affiche le nom de la police réellement utilisée,
la taille, la graisse, le style, la couleur et la pile `font-family` complète.

## Installation
1. Ouvrez `chrome://extensions`
2. Activez le **Mode développeur**
3. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `font-finder`

## Utilisation
Sélectionnez du texte avec la souris. `Échap` ou un clic ailleurs ferme la bulle.

## Limites
Le navigateur n'expose pas directement la police finale rendue : l'extension teste chaque police de la pile CSS
et retient la première réellement disponible (Google Fonts, polices système, etc.).
