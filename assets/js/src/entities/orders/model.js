var DualModel = require('lib/config/dual-model');
var Radio = require('backbone.radio');
var debug = require('debug')('orderModel');
var _ = require('lodash');
var Utils = require('lib/utilities/utils');

module.exports = DualModel.extend({
  name: 'order',
  defaults: function(){
    var defaults = {
          note: '',
          order_discount: 0
        },
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
    this.cart = Radio.request('entities', 'get', {
      init : true,
      type : 'collection',
      name : 'cart'
    });

    $.when(this.cart._isReady).then(function(cart){
      if(cart){
        cart.fetchCartItems({order_id: this.id});
      }
    });

    this.listenTo(this.cart, 'add remove change', this.calcTotals);
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

  calcTotals: function(){
    var subtotal,
        subtotal_tax,
        total_tax = 0,
        total;

    // special case, no items in cart
    if(this.cart.length === 0){
      return this.destroy();
    }

    // sum up the line totals
    subtotal      = this.cart.sum('subtotal');
    subtotal_tax  = this.cart.sum('subtotal_tax');
    total         = this.cart.sum('total');

    var tax = this.collection ? this.collection.tax : undefined;
    if( tax && tax.calc_taxes === 'yes' ) {
      total_tax   = this.cart.sum('total_tax');
    }

    // create totals object
    var totals = {
      'total'         : Utils.round( total, 4 ),
      'subtotal'      : Utils.round( subtotal, 4 ),
      'subtotal_tax'  : Utils.round( subtotal_tax, 4 ),
      'cart_discount' : Utils.round( subtotal - total, 4 ),
      'total_tax'     : Utils.round( total_tax, 4 ),
      'tax_lines'     : this.cart.itemizedTax()
    };

    this.save(totals, { success: this.onSaveSuccess, wait: true });
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
    this.processCart();
    //this.serverSync();
    console.log(this.toJSON());
  },

  processCart: function(){
    var obj = {
      product : [],
      shipping: [],
      fee     : []
    };

    this.cart.each(function(model){
      var type = model.get('type');
      if(type !== 'shipping' && type !== 'fee'){
        type = 'product';
      }
      obj[type].push(model.toJSON());
    });

    this.set({
      line_items    : obj.product,
      shipping_lines: obj.shipping,
      fee_lines     : obj.fee
    });
  }

});