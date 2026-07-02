# ColorizeSVGAction

The `ColorizeSVGAction` is a custom toolbar action for the `Leaflet.DistortableImage` plugin that allows users to dynamically change the colors of SVG overlays on the map.

## Overview

When a user selects an SVG image overlay and clicks the main colorize button in the edit toolbar, a sub-toolbar expands displaying a palette of predefined colors. Clicking any of these colors immediately recolors the SVG.

This feature relies on two main components:
1. **The User Interface (`ColorizeSVGAction.js`)**: Handles the rendering of the toolbar icons and events.
2. **The Logic (`DistortableImage.Edit.js`)**: Handles the actual fetching, parsing, and modification of the SVG contents.

## Components & Functions

### 1. `L.ColorizesvgAction` (in `ColorizeSVGAction.js`)
This is the primary (parent) action that is added to the Leaflet Distortable Image toolbar.
- **Functionality**: It checks whether the currently selected overlay is a valid SVG image. If it is an SVG, the button is enabled; otherwise, it is disabled.
- **Interaction**: Clicking this action toggles the visibility of the color palette sub-toolbar (`L.ColorizesvgToolbar2`).

### 2. `colourActions` Iterator (in `ColorizeSVGAction.js`)
This is an array of dynamically generated toolbar actions (one for each color in the predefined palette).
- **Functionality**: Each action renders a specific color block in the sub-toolbar.
- **`addHooks()`**: When a specific color is clicked, the `addHooks()` method is triggered. It simply delegates the operation to the overlay's edit handler by calling `this._overlay.editing._setColour(o)` with the selected color string (e.g., `'red'`).

### 3. `_setColour(color)` (in `DistortableImage.Edit.js`)
This is the core method responsible for applying the color modification programmatically.

- **Parameters**: `color` - A string representing the color to apply (e.g., `'red'`, `'#FF5733'`).
- **State Management**: It updates internal states such as `this._colour` and `this._overlay.options.svgColor` to track the current color, and adds a `data-colour` attribute to the DOM element for external querying.
- **SVG Processing (`processSvgText`)**: 
  - Parses the raw SVG text into a DOM structure using `DOMParser`.
  - Iterates through the SVG paths, shapes, text, and group elements.
  - Automatically identifies elements that are explicitly black (or inherit black/none) and replaces their `fill` and `stroke` attributes with the newly requested color.
- **Rendering**: Converts the modified SVG DOM back into a string and generates a `Blob` URL (`URL.createObjectURL`). This Blob URL is then assigned to the image `src` to instantly update the map overlay.
- **Cache & Fetch**: If the original SVG text is not yet cached, it performs an asynchronous `fetch()` using the overlay's `src` or `alt` URL to download the original markup before processing.

## Programmatic Usage
Because the SVG processing logic is centralized in the edit handler, developers can bypass the toolbar UI entirely and colorize an SVG overlay programmatically:

```javascript
// Change the color of an existing SVG overlay to orange
mySvgOverlay.editing._setColour('orange');
```
