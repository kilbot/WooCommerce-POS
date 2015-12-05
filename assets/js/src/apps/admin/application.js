var Application = require('lib/config/application');
var bb = require('backbone');
//var _ = require('lodash');
var LayoutView = require('./layout-view');
var debug = require('debug')('admin');
var Radio = require('backbone.radio');
var routerChannel = Radio.channel('router');

module.exports = Application.extend({

  initialize: function() {
    this.listenTo(routerChannel, {
      'before:enter:route' : this.onBeforeEnterRoute,
      'enter:route'        : this.onEnterRoute,
      'error:route'        : this.onErrorRoute
    });
  },

  onBeforeStart: function(){
    debug( 'starting WooCommerce POS admin app' );

    // init Root LayoutView
    this.layout = new LayoutView();
    this.layout.render();
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

  onEnterRoute: function() {
    this.transitioning = false;
    //this.$body.scrollTop(0);
    //nprogress.done();
  },

  onErrorRoute: function() {
    this.transitioning = false;
    //nprogress.done(true);
  }
});