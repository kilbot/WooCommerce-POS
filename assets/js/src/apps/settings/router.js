var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var General = require('./general/route');
var Checkout = require('./checkout/route');
var Access = require('./access/route');
var Tools = require('./tools/route');
var Tabs = require('lib/components/tabs/view');
var bb = require('backbone');
var Radio = bb.Radio;
var $ = require('jquery');
var _ = require('lodash');

var SettingsRouter = Router.extend({
  initialize: function(options) {
    this.container = options.container;
    this.collection = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'settings'
    });
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.listenTo(this.layout, 'show', this.showTabs);
    this.container.show(this.layout);
  },

  routes: {
    ''        : 'showGeneral',
    'general' : 'showGeneral',
    'checkout': 'showCheckout',
    'access'  : 'showAccess',
    'tools'   : 'showTools'
  },

  showTabs: function(){
    var tabs = [];

    // check page for templates
    $('.tmpl-wc-pos-settings').each(function(){
      tabs.push({
        id: $(this).data('id'),
        label: $(this).data('label')
      });
    });

    var view = new Tabs({
      collection: tabs
    });

    // init active tab
    var id = bb.history.getFragment() || 'general';
    view.collection.get(id).set({active:true});

    this.listenTo(view, 'show', function(){
      // use wordpress admin styles
      view.$el.addClass('nav-tab-wrapper');
      view.children.each(function(child){
        child.$el.addClass('nav-tab');
      });
    });

    this.listenTo(view.collection, 'change:active', function(model, active){
      if(active){
        this.navigate(model.id, {
          trigger: true,
          replace: true
        });
      }
    });

    this.layout.tabsRegion.show(view);
  },

  showGeneral: function(){
    return new General({
      container : this.layout.settingsRegion,
      collection: this.collection
    });
  },

  showCheckout: function(){
    return new Checkout({
      container : this.layout.settingsRegion,
      collection: this.collection
    });
  },

  showAccess: function(){
    return new Access({
      container : this.layout.settingsRegion,
      collection: this.collection
    });
  },

  showTools: function(){
    return new Tools({
      container : this.layout.settingsRegion
    });
  }

});

module.exports = SettingsRouter;
POS.attach('SettingsApp.Router', SettingsRouter);