var App = require('lib/config/application');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var Tools = require('./tools/route');
var Status = require('./status/route');
var bb = require('backbone');
var _ = require('lodash');
var Radio = require('backbone.radio');

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
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings'
    });

    // get active tab from url fragment
    var activeId = bb.history.getHash().split('/')[0] || 'general';

    // pass id & label collection to tabs
    var view = Radio.request('tabs', 'view', {
      collection: _.map( settings,
        _.partial( _.ary(_.pick, 2), _, ['id', 'label'] )
      ),
      tabsTagName: 'div',
      tabsClassName: 'nav-tab-wrapper',
      activeClassName: 'nav-tab-active',
      childViewOptions: function( model ){
        var options = {
          tagName: 'a',
          className: 'nav-tab'
        };
        if( model.id === activeId ){
          options.className += ' nav-tab-active';
        }
        return options;
      }
    });

    this.listenTo(view, 'childview:click', function(view){
      this.navigate(view.model.id, { trigger: true });
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