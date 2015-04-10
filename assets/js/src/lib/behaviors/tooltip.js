var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
require('bootstrap-sass/assets/javascripts/bootstrap/tooltip');

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
POS.attach('Behaviors.Tooltip', Tooltip);