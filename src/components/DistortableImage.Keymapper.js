L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.Keymapper = L.Handler.extend({

  options: {
    position: 'topright',
  },

  initialize: function(map, options) {
    this._map = map;
    L.setOptions(this, options);
  },

  addHooks: function() {
    if (!this._keymapper) {
      this._toggler = this._toggleButton();
      this._scrollWrapper = this._wrap();
      this._setMapper(this._toggler, this._scrollWrapper);

      L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.on(this._scrollWrapper, {
        click: L.DomEvent.stop,
        mouseenter: this._disableMap,
        mouseleave: this._enableMap,
      }, this);
    }
  },

  removeHooks: function() {
    if (this._keymapper) {
      L.DomEvent.off(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.off(this._scrollWrapper, {
        click: L.DomEvent.stop,
        mouseenter: this._disableMap,
        mouseleave: this._enableMap,
      }, this);

      L.DomUtil.remove(this._toggler);
      L.DomUtil.remove(this._scrollWrapper);
      L.DomUtil.remove(this._keymapper._container);
      this._keymapper = false;
    }
  },

  _toggleButton: function() {
    var toggler = L.DomUtil.create('a', '');
    toggler.setAttribute('id', 'toggle-keymapper');
    toggler.setAttribute('href', '#');
    toggler.setAttribute('role', 'button');
    toggler.setAttribute('title', 'Show Keybindings');
    toggler.innerHTML = L.IconUtil.create('keyboard_open');

    return toggler;
  },

  _wrap: function() {
    var wrap = L.DomUtil.create('div', '');
    wrap.setAttribute('id', 'keymapper-wrapper');
    wrap.style.display = 'none';

    return wrap;
  },

  _setMapper: function(button, wrap) {
    this._keymapper = L.control({position: this.options.position});

    this._container = this._keymapper.onAdd = function() {
      var elWrapper = L.DomUtil.create('div', 'ldi-keymapper-hide');
      elWrapper.setAttribute('id', 'ldi-keymapper');
      var divider = L.DomUtil.create('br', 'divider');
      elWrapper.appendChild(divider);
      elWrapper.appendChild(wrap);
      wrap.insertAdjacentHTML(
        'beforeend',
        '<table><tbody>' +
          '<hr id="keymapper-hr">' +
          /* eslint-disable */
          '<tr><td><div class="left"><span>Rotate Mode</span></div><div class="right"><kbd>a</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Scale Mode</span></div><div class="right"><kbd>s</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>RotateScale Mode</span></div><div class="right"><kbd>r</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Distort Mode</span></div><div class="right"><kbd>d</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Lock (Mode) / Unlock Image</span></div><div class="right"><kbd>l</kbd>\xa0<kbd>u</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Stack up / down</span></div><div class="right"><kbd>j</kbd>\xa0<kbd>k</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Add / Remove Image Border</span></div><div class="right"><kbd>b</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Toggle Opacity</span></div><div class="right"><kbd>o</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Deselect All</span></div><div class="right"><kbd>esc</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Delete Image</span></div><div class="right"><kbd>delete</kbd>\xa0<kbd>backspace</kbd></div></td></tr>' +
          '</tbody></table>'
      );
      /* eslint-enable */
      elWrapper.appendChild(button);
      return elWrapper;
    };

    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function(e) {
    L.DomEvent.stop(e);
    var container = document.getElementById('ldi-keymapper');
    var keymapWrap = document.getElementById('keymapper-wrapper');

    var newClass = container.className === 'ldi-keymapper leaflet-control' ?
      'ldi-keymapper-hide leaflet-control' : 'ldi-keymapper leaflet-control';
    var newStyle = keymapWrap.style.display === 'none' ? 'block' : 'none';

    container.className = newClass;
    keymapWrap.style.display = newStyle;

    L.IconUtil.toggleTooltip(this._toggler,
        'Show Keybindings', 'Hide Keybindings');
    this._toggler.innerHTML = this._toggler.innerHTML === 'close' ?
      L.IconUtil.create('keyboard_open') : 'close';
    L.DomUtil.toggleClass(this._toggler, 'close-icon');
  },

  _disableMap: function() {
    this._map.scrollWheelZoom.disable();
    this._map.dragging.disable();
  },

  _enableMap: function() {
    this._map.scrollWheelZoom.enable();
    this._map.dragging.enable();
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) {
      return;
    }

    var el = document.createElement('div');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  },
});

L.DistortableImage.Keymapper.addInitHook(function() {
  L.DistortableImage.Keymapper.prototype._n =
    L.DistortableImage.Keymapper.prototype._n ?
      L.DistortableImage.Keymapper.prototype._n + 1 : 1;

  if (L.DistortableImage.Keymapper.prototype._n === 1) {
    this.enable();
    this._injectIconSet();
  }
});

L.distortableImage.keymapper = function(map, options) {
  return new L.DistortableImage.Keymapper(map, options);
};
