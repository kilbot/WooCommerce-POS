var bb = require('backbone');
var POS = require('lib/utilities/global');

module.exports = POS.LayoutView = bb.Marionette.LayoutView.extend({

  working: function( action ) {
    if (action === 'start') {
      this.$el.addClass('working');
    } else {
      this.$el.removeClass('working');
    }
  }

});