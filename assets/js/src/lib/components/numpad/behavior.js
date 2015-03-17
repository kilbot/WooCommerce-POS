var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
var Modernizr = global['Modernizr'];
var NumpadView = require('./view');
var Radio = require('backbone.radio');
var $ = require('jquery');

var NumpadBehavior = Behavior.extend({

  ui: {
    input: '*[data-numpad]'
  },

  events: {
    'click @ui.input' : 'numpadPopover',
    'open:numpad @ui.input' : 'numpadPopover'
  },

  onShow: function() {
    if(Modernizr.touch) {
      this.$('*[data-numpad]').attr('readonly', true);
    }
  },

  numpadPopover: function(e){
    var input = $(e.currentTarget),
        placement = input.data('placement') || 'bottom';

    var numpad = new NumpadView({
      target    : input,
      model     : this.view.model,
      parent    : this.view
    });

    var options = {
      target    : input,
      view      : numpad,
      parent    : this.view,
      className : 'popover popover-numpad popover-dark-bg',
      placement : placement
    };

    Radio.request('popover', 'open', options);
  }

});

module.exports = NumpadBehavior;
POS.attach('Behaviors.Numpad', NumpadBehavior);