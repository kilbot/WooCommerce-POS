var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var FormRoute = require('./form/route');
var StatusRoute = require('./status/route');
var Radio = require('backbone.radio');
var Collection = require('lib/config/collection');
var $ = require('jquery');

module.exports = Router.extend({

  routes: {
    'support' : 'show'
  },

  initialize: function(options) {
    this.container = options.container;
    this.collection = new Collection();
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
  },

  onBeforeRoute: function(){
    // TODO: put menu into params
    var title = $('#menu li.support').text();
    Radio.command('header', 'update:title', title);
    Radio.command('header', 'update:tab', {id: 'left', active: true});
  },

  show: function(){
    this.execute(this.showForm);
    this.showStatus();
  },

  showForm: function(){
    return new FormRoute({
      container  : this.layout.leftRegion
    });
  },

  showStatus: function(){
    var route = new StatusRoute({
      container  : this.layout.rightRegion,
      collection : this.collection
    });
    route.enter();
  }

});