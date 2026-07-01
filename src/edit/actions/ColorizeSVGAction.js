const colours = ['black', 'gray', 'white', 'red', 'green', 'cyan', 'blue', 'purple', 'orange', 'brown'];

// Custom CSS for the colour subtoolbar items
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

// Generate one toolbar action per colour
const colourActions = colours.map((o) => {
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
      this._overlay.editing._setColour(o);
    },
  });
});

L.ColorizesvgToolbar2 = L.Toolbar2.extend({
  options: {
    className: '',
    filter: function () { return true; },
    actions: [],
    style: `translate(-1px, -${(colourActions.length + 1) * 30}px)`,
  },

  appendToContainer(container) {
    const baseClass = this.constructor.baseClass + '-' + this._calculateDepth();
    const className = baseClass + ' ' + this.options.className;
    let Action; let action;
    let i; let j; let l; let m;

    this._container = container;
    this._ul = L.DomUtil.create('ul', className, container);
    this._ul.style.transform = (this.options.style) ? this.options.style : '';

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
      L.DomEvent.on(
        this._ul, this._disabledEvents[j], L.DomEvent.stopPropagation
      );
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
  options: {
    title: 'Set custom SVG color',
    titleDisabled: 'Only available for SVG images',
    titleActive: 'Make SVG colored',
    titleCancel: 'Cancel',
  },

  // Returns true if the overlay image is an SVG (by URL or MIME type).
  // Checks options.alt (project-specific), _url (Leaflet standard) and
  // img.src (covers data:image/svg+xml and blob URLs after first colorization).
  _isSvgOverlay(overlay) {
    const url = (overlay.options.alt || overlay._url || '').toLowerCase();
    if (url.endsWith('.svg') || url.includes('image/svg+xml') || url.includes('image/svg')) {
      return true;
    }
    const src = (overlay.getElement() ? overlay.getElement().src : '').toLowerCase();
    return src.includes('image/svg+xml') || src.endsWith('.svg');
  },

  initialize(map, overlay, options) {
    const edit = overlay.editing;
    const mode = edit._mode;
    const isSvg = this._isSvgOverlay(overlay);

    options = options || {};
    L.Util.setOptions(this, options);

    this.options.toolbarIcon = {
      svg: true,
      html: 'colours_cercle',
      tooltip: isSvg ? this.options.title : this.options.titleDisabled,
      className: (mode === 'lock' || !isSvg) ? 'disabled' : '',
    };

    this.options.subToolbar = new L.ColorizesvgToolbar2({
      actions: colourActions,
    });

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_setColour';

    L.EditAction.prototype.initialize.call(this, map, overlay, this.options);
  },

  addHooks() {
    if (!this._isSvgOverlay(this._overlay)) return;

    const link = this._link;
    if (L.DomUtil.hasClass(link, 'subtoolbar_enabled')) {
      L.DomUtil.removeClass(link, 'subtoolbar_enabled');
      setTimeout(() => {
        this.options.subToolbar._hide();
      }, 100);
    } else {
      L.DomUtil.addClass(link, 'subtoolbar_enabled');
    }

    L.IconUtil.toggleXlink(link, 'colours_cercle', 'cancel');
    L.IconUtil.toggleTitle(link, this.options.titleActive, this.options.titleCancel);
  },
});
