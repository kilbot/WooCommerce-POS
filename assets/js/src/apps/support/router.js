var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var FormRoute = require('./form/route');
var StatusRoute = require('./status/route');

module.exports = Router.extend({
  columns: 2,

  initialize: function(options) {
    this.container = options.container;
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
  },

  routes: {
    'support' : 'show'
  },

  show: function(){
    this.showForm();
    this.showStatus();
  },

  showForm: function(){
    var route = new FormRoute({
      container  : this.layout.leftRegion
    });
    route.enter();
  },

  showStatus: function(){
    var route = new StatusRoute({
      container  : this.layout.rightRegion
    });
    route.enter();
  }

});