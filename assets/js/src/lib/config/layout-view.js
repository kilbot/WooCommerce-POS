var Mn = require('backbone.marionette');
var app = require('./application');

module.exports = app.prototype.LayoutView = Mn.LayoutView.extend({

  working: function( action ) {
    if (action === 'start') {
      this.$el.addClass('working');
    } else {
      this.$el.removeClass('working');
    }
  }

});