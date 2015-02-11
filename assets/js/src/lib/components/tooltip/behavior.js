var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
require('bootstrap-sass/assets/javascripts/bootstrap/tooltip');

var Tooltip = Behavior.extend({

  initialize: function(options){

  },

  ui: {
    tooltip: '*[data-toggle="tooltip"]'
  }

});

module.exports = Tooltip;
POS.attach('Behaviors.Tooltip', Tooltip);