var Application = require('lib/config/application');
var bb = require('backbone');
var LayoutView = require('./layout-view');
var debug = require('debug')('app');
var accounting = require('accounting');
var Radio = require('backbone.radio');
var routerChannel = Radio.channel('router');
var polyglot = require('lib/utilities/polyglot');

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

    // i18n
    polyglot.extend(options.i18n);
    delete options.i18n;

    // bootstrap accounting settings
    accounting.settings = options.accounting;
    delete options.accounting;

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
  },

  onBeforeEnterRoute: function() {
    //var self = this;
    this.transitioning = true;
    // Don't show for synchronous route changes
    //_.defer(function() {
    //  if (self.transitioning) {
    //    nprogress.start();
    //  }
    //});
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