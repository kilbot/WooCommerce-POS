var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var SettingsRoute = require('./show/route');
var Tabs = require('lib/components/tabs/view');
var bb = require('backbone');
var Radio = bb.Radio;
var $ = require('jquery');
var _ = require('lodash');

var SettingsRouter = Router.extend({
  settings: [],

  constructor: function() {
    var self = this;
    $('.tmpl-wc-pos-settings').each(function(){
      self.settings.push({
        id: $(this).data('id'),
        label: $(this).data('label')
      });
    });
    Router.apply(this, arguments);
  },

  initialize: function(options) {
    this.container = options.container;
    this.collection = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'settings'
    });
    this.collection.add(this.settings);
  },

  // add settings routes
  routes: function(){
    var routes = {
      '': 'showSettings'
    };
    _.each(this.settings, function(setting){
      routes[setting.id] = 'showSettings';
    });
    return routes;
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.listenTo(this.layout, 'show', this.showTabs);
    this.container.show(this.layout);
  },

  showTabs: function(){
    var tabs = new Tabs({
      collection: this.settings
    });

    // init active tab
    var id = bb.history.getFragment() || 'general';
    tabs.collection.get(id).set({active:true});

    this.listenTo(tabs, 'show', function(){
      // use wordpress admin styles
      tabs.$el.addClass('nav-tab-wrapper');
      tabs.children.each(function(tab){
        tab.$el.addClass('nav-tab');
      });
    });

    this.listenTo(tabs.collection, 'change:active', function(model, active){
      if(active){
        this.navigate(model.id, {
          trigger: true,
          replace: true
        });
      }
    });

    this.layout.tabsRegion.show(tabs);
  },

  showSettings: function(){
    var id = bb.history.getFragment() || 'general';
    return new SettingsRoute({
      container : this.layout.settingsRegion,
      model: this.collection.get(id)
    });
  }

});

module.exports = SettingsRouter;
POS.attach('SettingsApp.Router', SettingsRouter);