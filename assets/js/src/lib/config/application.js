var bb = require('backbone');
var POS = require('lib/utilities/global');

var Application = bb.Marionette.Application.extend({
  // Polyfill for:
  // https://github.com/marionettejs/backbone.marionette/pull/1723
  constructor: function() {
    bb.Marionette.Application.apply(this, arguments);
    this.initialize.apply(this, arguments);
  }
});

module.exports = Application;
POS.attach('Application', Application);