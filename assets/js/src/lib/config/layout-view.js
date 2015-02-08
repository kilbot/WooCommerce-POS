var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');

module.exports = POS.LayoutView = Mn.LayoutView.extend({

  working: function( action ) {
    if (action === 'start') {
      this.$el.addClass('working');
    } else {
      this.$el.removeClass('working');
    }
  }

});