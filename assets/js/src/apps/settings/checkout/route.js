var Route = require('lib/config/route');
//var debug = require('debug')('receipt');
var POS = require('lib/utilities/global');
var View = require('./view');

var SettingsRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.collection.add(
      {id: 'checkout'}
    );
  },

  fetch: function() {
    if(this.model.isNew()){
      return this.model.fetch();
    }
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.container.show(view);
  }

});

module.exports = SettingsRoute;
POS.attach('SettingsApp.Route', SettingsRoute);