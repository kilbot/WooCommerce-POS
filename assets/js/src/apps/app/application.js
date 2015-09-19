var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');
var accounting = require('accounting');
var polyglot = require('lib/utilities/polyglot');
var hbs = require('handlebars');

module.exports = Application.extend({

  initialize: function() {
    // init Root LayoutView
    this.layout = new LayoutView();
    this.layout.render();
  },

  /**
   * Set up application with start params
   */
  onBeforeStart: function(options){
    options = options || {};

    // debugging
    debug( 'starting WooCommerce POS app' );

    // attach templates to Handlebars global
    hbs.Templates = options.templates;

    // i18n
    polyglot.extend(options.i18n);

    // params
    this.options = options.params;

    // emulateHTTP
    bb.emulateHTTP = this.options.emulateHTTP === true;

    // bootstrap accounting settings
    accounting.settings = this.options.accounting;

    // start header service
    this.headerService.start();
  },

  onStart: function(){
    bb.history.start();
  }

});