var Route = require('lib/config/route');
var View = require('./view');

var ReceiptRoute = Route.extend({

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

module.exports = ReceiptRoute;