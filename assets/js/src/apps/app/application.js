var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');

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
    // debugging
    debug( 'starting WooCommerce POS app' );

    // start header service
    this.headerService.start();
  },

  onStart: function(){
    bb.history.start();
  }

});