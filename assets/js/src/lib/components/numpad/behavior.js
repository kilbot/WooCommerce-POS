var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
var Modernizr = global['Modernizr'];
var NumpadView = require('./view');
var Radio = require('backbone.radio');

var NumpadBehavior = Behavior.extend({

  initialize: function( options ) {

  },

  ui: {
    input: '*[data-numpad]'
  },

  events: {
    'click @ui.input'   : 'numpadPopover'
  },

  onShow: function() {
    if(Modernizr.touch) {
      this.$('*[data-numpad]').attr('readonly', true);
    }
  },

  numpadPopover: function(e){
    var numpad = new NumpadView({ model: this.view.model });
    var options = {
      target    : $(e.currentTarget),
      view      : numpad,
      className : 'popover popover-numpad popover-dark-bg',
      placement : 'bottom auto'
    };
    Radio.request('popover', 'open', options);
  }

});

module.exports = NumpadBehavior;
POS.attach('Behaviors.Numpad', NumpadBehavior);