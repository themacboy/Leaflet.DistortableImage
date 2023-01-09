let colours = ['black', 'gray', 'white', 'red', 'green', 'yellow', 'blue', 'orange']; // Set numeric values from 0 to 100.
// let colours = ['black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua']; // Set numeric values from 0 to 100.

// Add custom CSS scripts and overwrites. Pending for better implementation of CSSStyleSheet in browsers.
const subtoolbarCss = new CSSStyleSheet();
subtoolbarCss.replaceSync(
    `.leaflet-toolbar-icon-vertical {
        box-sizing: border-box !important;
        display: block !important;
        width: 30px !important;
        height: 30px !important;
        line-height: 30px !important;
        padding: 0 !important;
        text-align: center !important;
        text-decoration: none !important;
        background-color: #fff;
        border: inset 0.5px lightgray !important;
        font-size: 12px !important;
        font-weight: bold !important;
        color:#0087A8 !important;
        float: none !important;
        margin: auto !important;
        z-index:900 !important;
      }
    `
);

subtoolbarCss.insertRule(
    `.leaflet-toolbar-1 li:first-child a {
        border-radius: 4px 4px 0px 0px !important;
    }`
);
document.adoptedStyleSheets = [subtoolbarCss];

if ([...document.styleSheets].every((sheet => sheet.title != 'ColorizeSVG_colours_list'))) {
  const colourList = new CSSStyleSheet();
  // colourList.title = 'ColorizeSVG_colours_list';
  /*
  colourList.insertRule(
      `.colour_orange {
            filter: sepia(52%) saturate(917%) hue-rotate(354deg) brightness(95%) contrast(114%);
      }
      `
  );

  colourList.insertRule(
      `.colour_blue {
        filter: sepia(99%) saturate(6892%) hue-rotate(248deg) brightness(96%) contrast(144%);
      }
      `
  );
  */
  colours.map((o) => {
    colourList.insertRule(
        `.colour_${o} {
            fill:${o} !important;
            stroke:${o} !important;
            color:${o} !important;
          }
        `
    );
  });

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, colourList];
}

colours = colours.map((o) => {
  return L.EditAction.extend({
    options: {
      toolbarIcon: {
        html: o.charAt(0).toUpperCase(),
        tooltip: `colour_${o}`,
        className: 'leaflet-toolbar-icon-vertical',
        style: `background-color:${o};`,
      },
    },
    addHooks() {
      this._overlay.editing._setColour(`colour_${o}`);

      const img = this._overlay.getElement();
      console.log(img.src);
      console.log(img.alt);
      console.log(this._overlay.options.alt);
      console.log(img.getAttribute('alt'));

      fetch(this._overlay.options.alt)
          .then(response => response.text())
          .then( (response) => {
            const parser = new DOMParser();
            const svg = parser.parseFromString(response, 'image/svg+xml').documentElement;

            if (!svg.getAttribute('color') || svg.getAttribute('color') === '000' || svg.getAttribute('color') === '#030104') { svg.setAttribute('color', o); };
            if (!svg.getAttribute('fill') || svg.getAttribute('fill') === '000' || svg.getAttribute('fill') === '#030104') { svg.setAttribute('fill', o); };
            if (!svg.getAttribute('stroke') || svg.getAttribute('stroke') === '000' || svg.getAttribute('stroke') === '#030104') { svg.setAttribute('stroke', o); };

            svg.querySelectorAll('[fill]').forEach((elem) => {
              if (elem.getAttribute('fill') === '#000' || elem.getAttribute('fill') === '#030104') {
                elem.setAttribute('fill', o);
              }
            });

            svg.querySelectorAll('[stroke]').forEach((elem) => {
              if (elem.getAttribute('stroke') === '#000' || elem.getAttribute('stroke') === '#030104') {
                elem.setAttribute('stroke', o);
              }
            });

            img.src = URL.createObjectURL( new Blob( [new XMLSerializer().serializeToString( svg )], {type: 'image/svg+xml'} ) );

            this._overlay._reset();
            /*
            t_parametre.corners.forEach ((t_corner, t_index) => {
              t_element.setCorner (t_index, L.latLng (t_corner));
            });*/
          });
    },
  });
});

L.ColorizesvgToolbar2 = L.Toolbar2.extend({
  options: {
    className: '',
    filter: function() { return true; },
    actions: [],
    style: `translate(-1px, -${ ((colours.length + 1) * 30)}px)`,
  },

  appendToContainer(container) {
    const baseClass = this.constructor.baseClass + '-' + this._calculateDepth();
    const className = baseClass + ' ' + this.options.className;
    let Action; let action;
    let i; let j; let l; let m;

    this._container = container;
    this._ul = L.DomUtil.create('ul', className, container);
    this._ul.style.transform = ( this.options.style ) ? this.options.style : '';

    // Ensure that clicks, drags, etc. don't bubble up to the map.
    // These are the map events that the L.Draw.Polyline handler listens for.
    // Note that L.Draw.Polyline listens to 'mouseup', not 'mousedown', but
    // if only 'mouseup' is silenced, then the map gets stuck in a halfway
    // state because it receives a 'mousedown' event and is waiting for the
    // corresponding 'mouseup' event.
    this._disabledEvents = [
      'click', 'mousemove', 'dblclick',
      'mousedown', 'mouseup', 'touchstart',
    ];

    for (j = 0, m = this._disabledEvents.length; j < m; j++) {
      L.DomEvent.on(this._ul, this._disabledEvents[j], L.DomEvent.stopPropagation);
    }

    /* Instantiate each toolbar action and add its corresponding toolbar icon. */
    for (i = 0, l = this.options.actions.length; i < l; i++) {
      Action = this._getActionConstructor(this.options.actions[i]);

      action = new Action();
      action._createIcon(this, this._ul, this._arguments);
    }
  },
});


L.ColorizesvgAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    const edit = overlay.editing;
    const mode = edit._mode;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'colours_cercle',
      tooltip: 'Set custom SVG color',
      className: mode === 'lock' ? 'disabled' : '',
    };

    options.subToolbar = new L.ColorizesvgToolbar2({
      actions: colours,
    });

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_setColour';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const link = this._link;
    if (L.DomUtil.hasClass(link, 'subtoolbar_enabled')) {
      L.DomUtil.removeClass(link, 'subtoolbar_enabled');
      setTimeout(() => {
        this.options.subToolbar._hide();
      }, 100);
    } else {
      L.DomUtil.addClass(link, 'subtoolbar_enabled');
    };

    L.IconUtil.toggleXlink(link, 'colours_cercle', 'cancel');
    L.IconUtil.toggleTitle(link, 'Make SVG colored', 'Cancel');
  },
});
