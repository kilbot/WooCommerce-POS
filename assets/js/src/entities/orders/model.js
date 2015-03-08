var DualModel = require('lib/config/dual-model');
var Radio = require('backbone.radio');
var $ = require('jquery');
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

    // attach tax settings
    this.tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    }) || {};
    this.tax_rates = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax_rates'
    }) || {};

    if( !this.hasRemoteId() ){
      this.attachCart();
      this.attachGateways();
    }
    _.bindAll(this, 'onSaveSuccess', 'process');

    // order_discount input
    this.on('change:order_discount', this.calcTotals);
  },

  /**
   * Attach cart
   */
  attachCart: function(){
    this.cart = Radio.request('entities', 'get', {
      init : true,
      type : 'collection',
      name : 'cart',
      order_id  : this.id
    });

    $.when(this.cart._isReady).then(function(cart){
      if(cart){ cart.fetchCartItems(); }
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
    // special case, no items in cart
    if(this.cart.length === 0){
      return this.destroy();
    }

    var total_tax     = 0,
        subtotal_tax  = 0,
        shipping_tax  = 0,
        cart_discount_tax = 0,
        subtotal      = this.cart.sum('subtotal'),
        total         = this.cart.sum('total'),
        cart_discount = subtotal - total,
        order_discount = this.get('order_discount');

    if( this.tax.calc_taxes === 'yes' ) {
      total_tax         = this.cart.sum('total_tax');
      subtotal_tax      = this.cart.sum('subtotal_tax');
      shipping_tax      = this.cart.sum('total_tax', 'shipping');
      cart_discount_tax = subtotal_tax - total_tax;
    }

    total += total_tax;
    total -= order_discount;

    // create totals object
    var totals = {
      'total'             : Utils.round( total, 4 ),
      'subtotal'          : Utils.round( subtotal, 4 ),
      'total_tax'         : Utils.round( total_tax, 4 ),
      'subtotal_tax'      : Utils.round( subtotal_tax, 4 ),
      'shipping_tax'      : Utils.round( shipping_tax, 4 ),
      'cart_discount'     : Utils.round( cart_discount, 4 ),
      'cart_discount_tax' : Utils.round( cart_discount_tax, 4 ),
      'tax_lines'         : this.cart.itemizedTax()
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
    this.serverSync();
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