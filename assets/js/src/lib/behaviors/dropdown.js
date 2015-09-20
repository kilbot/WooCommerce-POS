var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
require('bootstrap-sass/assets/javascripts/bootstrap/dropdown');

var Dropdown = Behavior.extend({

  ui: {
    dropdown: '*[data-toggle="dropdown"]'
  }

});

module.exports = Dropdown;
App.prototype.set('Behaviors.Dropdown', Dropdown);