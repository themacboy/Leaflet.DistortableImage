L.ColorizesvgAction = L.EditAction.extend({
  initialize( map, overlay, options ) {
    const edit = overlay.editing;
    const mode = edit._mode;
    let use;
    let tooltip;
    /*
    if (edit._transparent) {
      use = 'opacity_empty';
      tooltip = overlay.options.translation.makeImageOpaque;
    } else {
      use = 'opacity';
      tooltip = overlay.options.translation.makeImageTransparent;
    }
    */
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'colours_cercle',
      tooltip: tooltip/*overlay.options.colorize*/,
      className: 'colorizesvg',
    };

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const edit = this._overlay.editing;
    //const link = this._link;
    
    //L.IconUtil.toggleXlink(link, 'colours_cercle', 'colours_cercle');
    //L.IconUtil.toggleTitle(link, 'Change SVG Colour', 'Change SVG Colour');
    edit._toggleOpacity();
    
  },
});
