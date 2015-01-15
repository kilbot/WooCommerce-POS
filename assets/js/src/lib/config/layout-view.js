var bb = require('backbone');
var POS = require('lib/utilities/global');

var LayoutView = bb.Marionette.LayoutView.extend({

  working: function( action ) {
    if (action === 'start') {
      this.$el.addClass('working');
    } else {
      this.$el.removeClass('working');
    }
  }

});

module.exports = LayoutView;
POS.attach('LayoutView', LayoutView);