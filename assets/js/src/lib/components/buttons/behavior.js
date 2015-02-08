var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');

var Buttons = Behavior.extend({

  ui: {
    toggle: '*[data-toggle="buttons"] .btn'
  },

  events: {
    'click @ui.toggle': 'toggleBtns'
  },

  toggleBtns: function(e){
    e.preventDefault();
    $(e.currentTarget)
      .addClass('active')
      .siblings('.btn')
      .removeClass('active');
  }

});

module.exports = Buttons;
POS.attach('Behaviors.Buttons', Buttons);