var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');

var HotKeys = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.container.show(view);
  }

});

module.exports = HotKeys;
POS.attach('SettingsApp.HotKeys.Route', HotKeys);