var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');
var accounting = require('accounting');
var polyglot = require('lib/utilities/polyglot');

module.exports = Application.extend({

  initialize: function() {

    // init Root LayoutView
    this.layout = new LayoutView();
    this.layout.render();
  },

  /**
   * Set up application with start params
   */
  onBeforeStart: function(){
    debug( 'starting WooCommerce POS app' );

    // emulateHTTP
    bb.emulateHTTP = this.options.emulateHTTP === true;

    // i18n
    polyglot.extend(this.options.i18n);

    // bootstrap accounting settings
    accounting.settings = this.options.accounting;

    // start header service
    this.headerService.start();
  },

  onStart: function(){
    bb.history.start();
  }

});