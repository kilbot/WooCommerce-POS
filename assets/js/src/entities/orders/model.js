var DualModel = require('lib/config/dual-model');
var Radio = require('backbone').Radio;
var debug = require('debug')('orderModel');
var _ = require('lodash');

module.exports = DualModel.extend({
  name: 'order',
  defaults: function(){
    var defaults = { note: '' },
        customers,
        default_customer;

    customers = Radio.request('entities', 'get', {
      type : 'option',
      name : 'customers'
    });

    if(customers){
      default_customer = customers['default'] || customers.guest;
    }

    if(default_customer){
      defaults.customer_id = default_customer.id;
      defaults.customer = default_customer;
    }

    return defaults;
  },

  initialize: function(){
    if( !this.hasRemoteId() ){
      this.attachCart();
      this.attachGateways();
    }
    _.bindAll(this, 'onSaveSuccess', 'process');
  },

  /**
   * Attach cart
   */
  attachCart: function(){
    var cart = Radio.request('entities', 'get', {
      init : true,
      type : 'collection',
      name : 'cart'
    });

    this.listenToOnce(cart, 'idb:ready', function() {
      cart.fetchCartItems({order_id: this.id});
    });

    this.listenTo(cart, {
      'update:totals': function(totals){
        this.save(totals, { success: this.onSaveSuccess });
      },
      'remove': function(){
        if(cart.length === 0){
          this.destroy();
        }
      }
    });

    this.cart = cart;
  },

  /**
   * Attach gateways
   */
  attachGateways: function(){
    this.gateways = Radio.request('entities', 'get', {
      init : true,
      type : 'collection',
      name : 'gateways'
    });
    this.gateways.fetch();
  },

  /**
   * special case, first save, update order_id
   */
  onSaveSuccess: function(){
    if(this.cart.order_id){
      return;
    }
    this.cart.order_id = this.id;
    this.cart.each(function(model) {
      model.save({order: this.id}, {silent: true});
    }, this);
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
  },

  /**
   * process order
   */
  process: function(){
    debug('process order ' + this.id);

  }

});