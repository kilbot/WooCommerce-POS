var Behavior = require('lib/config/behavior');
var _ = require('underscore');
var POS = require('lib/utilities/global');

module.exports = POS.Behaviors.Tooltip = Behavior.extend({

  initialize: function(options){

    this.options = _.defaults(options, {

    });

  },

  ui: {
    tooltip: '*[data-toggle="tooltip"]'
  },

  onRender: function() {
    this.ui.tooltip.tooltip( this.options );
  },

  onBeforeDestroy: function() {
    this.ui.tooltip.tooltip( 'destroy' );
  }

});