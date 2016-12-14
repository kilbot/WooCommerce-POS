var Collection = require('lib/config/collection');
var Model = require('./model');

module.exports = Collection.extend({

  model: Model,
  name: 'orders',
  extends: ['dual', 'filtered'],

  _syncDelayed: false,

  initialState: {
    filter: {
      order: 'DESC',
      orderby: 'id',
      limit: 10,
      // do not have qFields contain 'id', it will cause problems, use 'id:' instead
      qFields: [
        'customer.first_name',
        'customer.last_name',
        'customer.email',
        'billing_address.first_name',
        'billing_address.last_name',
        'billing_address.email'
      ]
    }
  },
  
  fetchOpenOrders: function(){
    return this.fetch({
      remote: false,
      fullSync: false,
      data: {
        filter: {
          order: 'ASC',
          orderby: 'local_id',
          limit: -1
        }
      },
      index: {
        keyPath: '_state',
        value: this.states.create
      }
    });
  }

});