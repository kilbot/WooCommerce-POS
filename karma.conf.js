module.exports = function (config) {
  var customLaunchers = require('./tests/integration/js/browsers');

  var configuration = {
    frameworks: ['mocha', 'sinon-chai'],

    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.js',
      'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone.js',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.radio/1.0.5/backbone.radio.js',
      'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.5.6/backbone.marionette.js',
      'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.js',
      'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.js',
      'https://cdnjs.cloudflare.com/ajax/libs/accounting.js/0.4.1/accounting.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.js',
      'assets/js/app.build.js',
      'tests/integration/js/spec.js',
      'tests/integration/js/spec/lib/config/idb-storage.js',
      'tests/integration/js/spec/lib/config/dual-storage.js'
    ],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    reporters: ['mocha', 'saucelabs'],

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-sinon-chai',
      'karma-mocha-reporter',
      'karma-sauce-launcher'
    ],

    sauceLabs: {
      testName: 'Integration Tests',
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      },
    },
    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // chai config
    client: {
      chai: {
        includeStack: true
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = Object.keys(customLaunchers);
    configuration.singleRun = true;
  }

  config.set(configuration);
};
