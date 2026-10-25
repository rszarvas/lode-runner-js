# Lode Runner – JavaScript prototípus

Böngészőben futó, önálló Canvas 2D játék, C64-hangulatú grafikával. **Ez még nem az eredeti C64 Lode Runner pontos rekonstrukciója**: a pályák, grafika, betűk és ellenfelek viselkedése közelítések.

## Indítás

Nyisd meg az `index.html` fájlt Chrome/Opera böngészőben. Nincs szükség telepítésre vagy webszerverre.

## Vezérlés

Nyilak vagy WASD: mozgás; Z/X: ásás balra/jobbra; P: szünet; R: újrakezdés. A gombok egérrel is használhatók.

## Fejlesztés

A **futó játék teljes forrása a `game.js`** fájlban van, ezt lehet közvetlenül módosítani. A `src/levels.js` jelenleg csak különálló, szerkeszthető pályaadat-referencia; a futó játék egyelőre a `game.js` belső pályatömbjét használja.

Következő feladat: eredeti D64 fájl elemzése, grafika/karakterkészlet és pályák visszafejtése, majd a forrás modulokra bontása. A D64 eredeti lemezkép nincs közzétéve ebben a nyilvános repositoryban.
