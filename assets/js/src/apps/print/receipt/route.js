var Route = require('lib/config/route');
var Radio = require('backbone.radio');
var View = require('./view');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.collection = Radio.request('entities', 'get', {
      name: 'orders',
      type: 'collection'
    });
  },

  fetch: function() {
    if (this.collection.length === 0) {
      return this.collection.fetch({ remote: true });
    }
  },

  render: function() {
    var view = new View({
      model: this.collection.at(0)
    });
    this.container.show(view);
  }

});

module.exports = ReceiptRoute;