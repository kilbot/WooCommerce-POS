var Application = require('lib/config/application');
var Backbone = require('backbone');
var debugLog = require('lib/utilities/debug');

/**
 * Create the app
 */
var app = new Application({

  initialize: function() {

  },

  /**
   * Set up application with start params
   */
  onBeforeStart: function(){
    debugLog( 'log', 'starting WooCommerce POS admin app' );
  },

  onStart: function(){

    Backbone.history.start();

    // header app starts on all pages
    //POS.HeaderApp.start();
  }
});

/**
 * Modules
 */
app.module( 'SettingsApp', {
  moduleClass: require('apps/settings/module'),
  container: app.layout.mainRegion
});

module.exports = app;