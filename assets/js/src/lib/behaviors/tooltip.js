var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
require('bootstrap/dist/js/umd/tooltip');

var Tooltip = Behavior.extend({

  initialize: function(options){
    this.options = options;
  },

  ui: {
    tooltip: '*[data-toggle="tooltip"]'
  },

  onRender: function() {
    this.ui.tooltip.tooltip( this.options );
  }

});

module.exports = Tooltip;
App.prototype.set('Behaviors.Tooltip', Tooltip);