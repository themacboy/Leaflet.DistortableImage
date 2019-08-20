L.IconUtil = {
  /* creates an svg elemenet with built in accessibility properties
   * and standardized classes for styling, takes in the fragment
   * identifier (id) of the symbol to reference. note for symplicity
   * we allow providing the icon target with or without the '#' prefix
   */
  create: function(ref) {
    if (/^#/.test(ref)) {
      ref = ref.replace(/^#/, '');
    }

    return (
      '<svg class="ldi-icon ldi-' + ref + '"role="img" focusable="false">' +
      '<use xlink:href="#' + ref + '"></use>' +
      '</svg>'
    );
  },

  addClassToSvg: function(container, loader) {
    var svg = container.querySelector('svg');

    if (svg) {
      L.DomUtil.addClass(svg, loader);
    }
  },

  removeClassFromSvg: function(container, loader) {
    var svg = container.querySelector('svg');

    if (svg) {
      L.DomUtil.removeClass(svg, loader);
    }
  },

  /** finds the use element and toggles its icon reference */
  toggleXlink: function(container, ref1, ref2) {
    if (!/^#/.test(ref1)) {
      ref1 = '#' + ref1;
    }
    if (!/^#/.test(ref2)) {
      ref2 = '#' + ref2;
    }

    var use = container.querySelector('use');
    if (use) {
      var toggled = use.getAttribute('xlink:href') === ref1 ? ref2 : ref1;
      use.setAttribute('xlink:href', toggled);
      return toggled;
    }
    return false;
  },

  toggleTooltip: function(container, title1, title2) {
    var toggled = container.getAttribute('title') === title1 ?
      title2 : title1;
    container.setAttribute('title', toggled);
    return toggled;
  },
};
