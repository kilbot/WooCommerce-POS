var Collection = require('lib/config/collection');
var Model = require('./model');

module.exports = Collection.extend({

  model: Model,
  name: 'orders',
  extends: ['dual', 'filtered'],

  _syncDelayed: false,

  // search fields
  fields: [
    'billing_address.first_name',
    'billing_address.last_name',
    'billing_address.email'
  ],
  
  fetchOpenOrders: function(){
    return this.fetch({
      remote: false,
      fullSync: false,
      index: {
        keyPath: '_state',
        value: this.states.create
      }
    });
  }

});