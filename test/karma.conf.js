// Karma configuration
// Generated on Tue Jul 08 2014 12:47:31 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    plugins: [
      require('mocha'),
      require('karma-mocha'),
      require('karma-coverage'),
      require('karma-mocha-reporter'),
      require('karma-phantomjs-launcher'),
      require('glfx'),
      require('webgl-distort/dist/webgl-distort.js')
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'examples/*.jpg', included: false, served: true },
      { pattern: 'examples/*.png', included: false, served: true },
      'node_modules/leaflet/dist/leaflet-src.js',
      'node_modules/leaflet/dist/leaflet.css',
      'node_modules/leaflet-toolbar/dist/leaflet.toolbar.js',
      'node_modules/leaflet-toolbar/dist/leaflet.toolbar.css',
      'node_modules/webgl-distort/dist/webgl-distort.js',
      'node_modules/glfx/glfx.js',
      'node_modules/chai/chai.js',
      'node_modules/sinon/pkg/sinon.js',
      'src/util/*.js',
      'src/DistortableImageOverlay.js',
      'src/DistortableCollection.js',
      'src/edit/getEXIFdata.js',
      'src/edit/handles/EditHandle.js',
      'src/edit/handles/*.js',
      'src/iconsets/IconSet.js',
      'src/iconsets/KeymapperIconSet.js',
      'src/iconsets/ToolbarIconSet.js',
      'src/edit/actions/EditAction.js',
      'src/edit/actions/*.js',
      'src/edit/DistortableImage.PopupBar.js',
      'src/edit/DistortableImage.ControlBar.js',
      'src/edit/DistortableImage.Edit.js',
      'src/edit/DistortableCollection.Edit.js',
      'src/components/DistortableImage.Keymapper.js',
      'src/edit/BoxSelector.js',
      'test/SpecHelper.js',
      'test/src/*Spec.js',
      'test/src/**/*Spec.js'
    ],

    // so that karma can serve examples/example.png
    proxies: {
      '/examples/': '/base/examples/'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    preprocessors: {
      '../src/**/*.js': 'coverage'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE
    // || config.LOG_ERROR
    // || config.LOG_WARN
    // || config.LOG_INFO
    // || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    background: false,

    coverageReporter: {
      reporters: [
        { type: 'text', dir: '../coverage/', file: 'coverage.txt' },
        { type: 'lcovonly', dir: '../coverage/' },
        { type: 'html', dir: '../coverage/' }
      ]
    }
  });
};
