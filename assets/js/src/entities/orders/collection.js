var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');

module.exports = DualCollection.extend({

  model: Model,

  name: 'orders',

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