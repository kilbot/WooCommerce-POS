var DualModel = require('lib/config/dual-model');
var Cart = require('entities/cart/collection');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');

module.exports = DualModel.extend({
  name: 'order',
  defaults: {
    note: ''
  },

  initialize: function(){
    if( !this.hasRemoteId() ){
      this.attachCart();
    }
  },

  /**
   * Attach cart
   */
  attachCart: function(){
    var cart = entitiesChannel.request('get', {
      new     : true,
      type    : 'collection',
      name    : 'cart',
      order_id: this.get('local_id')
    });

    cart.once('idb:ready', function() {
      cart.fetchOrder();
    });

    this.listenTo(cart, 'update:totals', function(totals){
      this.save(totals);
    });

    this.cart = cart;
  },

  voidOrder: function(){
    _.invoke( this.cart.toArray(), 'destroy' );
  },

  /**
   * Convenience method to sum attributes
   */
  sum: function(array){
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += this.get(array[i]);
    }
    return sum;
  }
});