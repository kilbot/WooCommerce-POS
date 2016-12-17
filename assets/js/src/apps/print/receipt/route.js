var Route = require('lib/config/route');
var Radio = require('backbone.radio');

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
      return this.collection.fetch({
        remote: true,
        data: {
          dummy: 1,
          filter: {
            limit: 1
          }
        }
      });
    }
  },

  render: function() {
    var self = this;
    return Radio.request('print', 'view', {
      model: this.collection.first()
    })
    .then(function(view){
      self.container.show(view);
    });
  }

});

module.exports = ReceiptRoute;