# Documentació: ColorizeSVGAction

## Visió General

`ColorizeSVGAction` és una extensió d'acció de la barra d'eines (`L.EditAction`) de `Leaflet.DistortableImage`. Permet seleccionar una imatge SVG incrustada al mapa i aplicar-li una paleta de colors definits. Modifica en temps real les propietats XML internes del gràfic vectorial mantenint la seva distorsió, escala i orientació originals en el pla geogràfic.

---

## 1. Detecció d'imatges SVG

A causa de la naturalesa de Leaflet on es treballa amb imatges rasteritzades principalment, l'acció incorpora el mètode intern `_isSvgOverlay(overlay)` per identificar si la capa activa admet ser colorejada.

Per establir aquesta viabilitat, l'algoritme analitza:
1. **L'extensió de l'arxiu:** Comprova si la ruta font original acaba en `.svg`. S'extreu de les variables `overlay.options.alt` (específic pel projecte) o `overlay._url` (estàndard de Leaflet).
2. **El format MIME:** Comprova si la URL conté `image/svg+xml` o `image/svg` (particularment valuós quan s'utilitzen dades base64 o objectes BLOB d'operacions prèvies en l'historial d'accions).

> [!NOTE]
> Si la capa seleccionada no supera la prova (p. ex: `.jpg`, `.png`), el botó s'afegeix però es desactiva dinàmicament mitjançant la classe CSS `.disabled` de la llibreria base, amb un missatge clar a la interfície (_tooltip_).

---

## 2. Procés d'Acolorejat (The Fetch & Parse Engine)

L'acció implementa un enfocament basat en DOM-parsing, descarregant en memòria el codi font del vector, editant-lo i creant un Blob intern per tornar-lo a passar com a nova imatge al Canvas/Mapa.

### Origen de les dades (Fetch i Lazy Caching)
S'obté el contingut mitjançant `fetch()`:
```javascript
const fetchUrl = (this._overlay.options.isText && this._overlay.options.src)
  ? this._overlay.options.src
  : this._overlay.options.alt;
```
D'aquesta manera s'assegura la integració no només d'icones clàssiques sinó també d'eines externes complexes, com l'eina de "TextTool", que defineixen dinàmicament el seu origen.

**Lazy Caching i Solució a CORS:**
Per evitar peticions redundants a la xarxa cada vegada que l'usuari clica un color, l'acció implementa un *Lazy Cache*: la primera vegada que es descarrega l'XML de l'SVG, es guarda a la propietat de memòria `this._overlay.options.originalSvgText`. Els successius canvis de color llegiran directament d'aquesta propietat de forma sincrònica.

Això a més proporciona una porta posterior per saltar-se bloquejos de **CORS** per imatges d'altres dominis. Un desenvolupador pot instanciar la imatge passant l'XML directament:
```javascript
L.distortableImageOverlay('http://domini-extern.com/icona.svg', {
    originalSvgText: '<svg>...</svg>'
}).addTo(map);
```
En fer-ho, `ColorizeSVGAction` no farà cap `fetch()` a la xarxa, utilitzant la memòria cau proporcionada automàticament.

### Modificació intel·ligent del codi (Parsing)
S'evita el simple reemplaçament global de cadenes (p. ex. canviar totes les aparicions d'un string) a favor del `DOMParser` per respectar l'herència de l'arquitectura d'arbres SVG:

1. **Acolorejat Root (`<svg>`):** S'injecta el color sol·licitat als atributs d'emplenament general de l'arrel.
2. **Preservació de Blancs i Transparències:** Tot aquell element explicitament definit com a `#fff`, `white`, `none`, o `transparent` és silenciosament descartat per no perdre efectes interns d'icones (com la zona central blanca d'una "A" o els reflexos).
3. **Control d'herència per elements no assignats:** 
   - A diferència dels editors estàndards, si un polígon **no té color definit**, l'algorisme rastreja iterativament fins al pare root (`elem.parentNode`) per preveure si hereta una propietat de fons protegida (com ara `white`). Només s'acoloreix si se certifica que l'element originalment es dibuixava per defecte en negre al no tenir una atribució explícita.
4. **Control estructural de Línies (`<line>`, `<polyline>`):** Mentre que la majoria d'elements no adquireixen un `stroke` (vora) si no en tenien per evitar sobre-gruixos distorsionants, les línies i polilínies són sempre colorejades fins i tot si no tenien cap stroke pre-determinat.

---

## 3. Persistència de la Geometria (Corners Fix)

Leaflet.DistortableImage té un comportament reactiu: si detecta que la propietat `src` d'un `<image>` canvia, dispara un event `load` per recalcular les mides físiques per defecte i perdia la posició modificada per l'usuari fins aquell moment.

`ColorizeSVGAction` prevé això protegint la malla distorsionada abans d'activar el blob:
```javascript
// Es fan back-up de les coordenades actuals (LatLong)
const savedCorners = this._overlay.getCorners().map(c => L.latLng(c));

// Es registra un "listener" temporal limitat a la primera recarrega
img.addEventListener('load', () => {
    // Es restitueixen d'immediat al mapa
    this._overlay.setCorners(corners);
}, { once: true });
```
> [!TIP]
> Gràcies al `{ once: true }` aquest fil paral·lel de sincronització automàtica es destrueix ràpidament un cop consumit, alliberant recursos de memòria del navegador.

---

## 4. Retenció de Dades (`options.svgColor`)

A causa del requeriment de recrear o exportar vectors del mapa de forma nativa a bases de dades per la teva eina ("PoliciaLocalCroquis"), l'acció grava l'últim color aplicat dins la base de dades pròpia del sistema de Leaflet:
```javascript
this._overlay.options.svgColor = o; 
```
Qualsevol part externa del projecte (com els exports, guardats SQL o el clonat d'imatges) poden accedir a `capa.options.svgColor` i conèixer que ha de ser tenyit novament o pre-tenyit durant el moment de ser importat.

---

## Integració GUI

- Genera un `SubToolbar` desplegable estilitzat via CSS dinàmic (`CSSStyleSheet.replaceSync`) per assegurar compatibilitat de format global de forma desatesa sense haver de modificar fitxers .css del projecte pare.
- Empra la paleta centralizada en un petit array (`const colours = ['black', 'gray', 'white', 'red', 'green', 'yellow', 'blue', 'orange']`) d'alta mantenibilitat; per sumar-hi o treure un color, només cal alterar aquesta línia i la interfície dibuixarà, crearà events globals i estructurarà el codi de les crides asincrònicament amb el nou format.
