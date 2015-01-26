var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');
var accounting = require('accounting');
var Radio = require('backbone').Radio;
var routerChannel = Radio.channel('router');

module.exports = Application.extend({

  initialize: function() {

    // init Root LayoutView
    this.layout = new LayoutView();
    this.layout.render();

    this.listenTo(routerChannel, {
      'before:enter:route' : this.onBeforeEnterRoute,
      'enter:route'        : this.onEnterRoute,
      'error:route'        : this.onErrorRoute
    });
  },

  /**
   * Set up application with start params
   */
  onBeforeStart: function(options){
    debug( 'starting WooCommerce POS app' );

    // app settings
    this.options = options;

    // bootstrap accounting settings
    accounting.settings = options.accounting;

    // global ajax settings
    bb.$.ajaxSetup({
      data: {
        security: function(){
          return Radio.request('entities', 'get', {
            type: 'option',
            name: 'nonce'
          });
        }
      },
      beforeSend: function(xhr){
        xhr.setRequestHeader('X-WC-POS', 1);
      },
      timeout: 50000
    });
  },

  onStart: function(){

    bb.history.start();

    // header app starts on all pages
    //POS.HeaderApp.start();
  },

  onBeforeEnterRoute: function() {
    var self = this;
    this.transitioning = true;
    // Don't show for synchronous route changes
    setTimeout(function() {
      if (self.transitioning) {
        console.log('loading');
        //nprogress.start();
      }
    }, 0);
  },

  onEnterRoute: function(route) {
    this.layout.columns(route.columns);

    this.transitioning = false;
    //this.$body.scrollTop(0);
    //nprogress.done();
  },

  onErrorRoute: function() {
    this.transitioning = false;
    //nprogress.done(true);
  }
});