var Application = require('lib/config/application');
var bb = require('backbone');
var _ = require('lodash');
var LayoutView = require('./layout-view');
var debug = require('debug')('admin');
var Radio = require('backbone.radio');
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
    options = options || {};

    debug( 'starting WooCommerce POS admin app' );

    // get settings tabs
    this.settingsApp.tabsArray = _.map(options.settings, function(setting){
      return _.pick(setting, ['id', 'label']);
    });

    // get settings data
    var data = _.map(options.settings, function(setting){
      _.set(setting, ['data', 'id'], setting.id);
      return setting.data;
    });

    // init settings
    var settings = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'settings'
    });

    settings.add( data );

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