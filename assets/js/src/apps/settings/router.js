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
    this.bootstrapTabs();
    this.bootstrapSettings();
    this.layout = new LayoutView();
    this.listenTo(this.layout, 'show', this.showTabs);
    this.container.show(this.layout);
  },

  bootstrapTabs: function(){
    var tabs = [],
        frag = bb.history.getFragment() || 'general';

    // check page for templates
    $('.tmpl-wc-pos-settings').each(function(){
      tabs.push({
        id    : $(this).data('id'),
        label : $(this).data('label'),
        active: ( $(this).data('id') === frag )
      });
    });

    this.tabsArray = tabs;
  },

  bootstrapSettings: function(){
    var settings = window.wc_pos_settings;

    _.each(settings, function(setting, id){
      var model = this.collection.add(setting);
      model.set({ id: id });
      model._isNew = false;
    }, this);
  },

  routes: {
    ''        : 'showGeneral',
    'general' : 'showGeneral',
    'checkout': 'showCheckout',
    'access'  : 'showAccess',
    'tools'   : 'showTools'
  },

  showTabs: function(){

    var view = new Tabs({
      collection: this.tabsArray
    });

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
      model: this.collection.get('general')
    });
  },

  showCheckout: function(){
    return new Checkout({
      container : this.layout.settingsRegion,
      model: this.collection.get('checkout')
    });
  },

  showAccess: function(){
    return new Access({
      container : this.layout.settingsRegion,
      model: this.collection.get('access')
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