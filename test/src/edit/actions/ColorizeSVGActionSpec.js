describe('L.ColorizesvgAction', () => {
  let map;
  let ov;

  beforeEach((done) => {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    // Initialize with a standard JPG first to ensure proper load event fires
    ov = L.distortableImageOverlay('/examples/example.jpg', {
      actions: [L.ColorizesvgAction],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov.getElement(), 'load', () => { done(); });
  });

  afterEach(() => {
    L.DomUtil.remove(ov);
  });

  it('Should correctly identify non-SVG images as false', () => {
    const action = new L.ColorizesvgAction();
    action.initialize(map, ov);
    expect(action._isSvgOverlay(ov)).to.be.false;
  });

  it('Should correctly identify SVG images by options.alt (project-specific)', () => {
    const svgOv = L.distortableImageOverlay('/examples/example.jpg', {
      alt: 'test.svg',
    });
    
    // We don't need to add it to the map to test the internal SVG detector
    const action = new L.ColorizesvgAction();
    expect(action._isSvgOverlay(svgOv)).to.be.true;
  });

  it('Should correctly identify SVG images by standard Leaflet _url', () => {
    const svgOv = L.distortableImageOverlay('/examples/test.svg');
    
    const action = new L.ColorizesvgAction();
    expect(action._isSvgOverlay(svgOv)).to.be.true;
  });

  it('Should correctly identify inline SVG data URLs', () => {
    const svgOv = L.distortableImageOverlay('data:image/svg+xml;base64,PHN2Zy...=');
    
    const action = new L.ColorizesvgAction();
    expect(action._isSvgOverlay(svgOv)).to.be.true;
  });

  it('Should assign a disabled class to the toolbar icon if the image is not an SVG', () => {
    const action = new L.ColorizesvgAction();
    action.initialize(map, ov); // ov is example.jpg
    
    expect(action.options.toolbarIcon.className).to.equal('disabled');
    expect(action.options.toolbarIcon.tooltip).to.equal('Only available for SVG images');
  });

  it('Should NOT assign a disabled class if the image is an SVG', () => {
    const svgOv = L.distortableImageOverlay('/examples/test.svg');
    const action = new L.ColorizesvgAction();
    // Simulate overlay editing initialization for the test
    svgOv.editing = { _mode: 'distort' };
    action.initialize(map, svgOv);
    
    expect(action.options.toolbarIcon.className).to.equal('');
    expect(action.options.toolbarIcon.tooltip).to.equal('Set custom SVG color');
  });
});
