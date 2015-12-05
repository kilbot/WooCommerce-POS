var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');
var BrowserModal = require('./modals/browser');
var Radio = require('backbone.radio');
var _ = require('lodash');
var Modernizr = global['Modernizr'];

module.exports = Application.extend({

  onBeforeStart: function(){
    debug( 'starting WooCommerce POS app' );

    // init Root LayoutView
    this.layout = new LayoutView();
    this.layout.render();
  },

  onStart: function(){
    // check browser
    if( ! this.browserCheck() ){
      return Radio.request('modal', 'error', new BrowserModal());
    }

    // start header service
    this.headerService.start();

    // start router
    bb.history.start();
  },

  browserCheck: function(){
    var props = ['flexbox', 'indexeddb'];
    return _.every(props, function(prop){ return Modernizr[prop]; });
  }

});