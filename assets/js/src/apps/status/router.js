var App = require('lib/config/application');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var Tools = require('./tools/route');
var Status = require('./status/route');
var bb = require('backbone');
var Radio = bb.Radio;

var StatusRouter = Router.extend({
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
    ''        : 'showTools',
    'tools'   : 'showTools',
    'status'  : 'showStatus'
  },

  onBeforeRoute: function() {
    this.layout.getRegion('footer').empty();
  },

  showTabs: function(){
    // this.tabsArray is added during POS.onBeforeStart
    var view = Radio.request('tabs', 'view', {
      tabs: this.collection.tabsArray,
      adminTabs: true
    });

    this.listenTo(view.collection, 'change:active', function(model, active){
      if(active){
        this.navigate(model.id, {
          trigger: true,
          replace: true
        });
      }
    });

    this.layout.getRegion('tabs').show(view);
  },

  showTools: function(){
    var model = this.collection.get('tools');
    return new Tools({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showStatus: function(){
    var model = this.collection.get('status');
    return new Status({
      container : this.layout.getRegion('settings'),
      model: model
    });
  }

});

module.exports = StatusRouter;
App.prototype.set('StatusApp.Router', StatusRouter);