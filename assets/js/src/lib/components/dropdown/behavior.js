var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
require('bootstrap-sass/assets/javascripts/bootstrap/dropdown');

var Dropdown = Behavior.extend({

  ui: {
    dropdown: '*[data-toggle="dropdown"]'
  }

});

module.exports = Dropdown;
POS.attach('Behaviors.Dropdown', Dropdown);