var DualModel = require('lib/config/dual-model');
var Radio = require('backbone.radio');
//var $ = require('jquery');
var _ = require('lodash');
var Utils = require('lib/utilities/utils');
var debug = require('debug')('order');

module.exports = DualModel.extend({
  name: 'order',

  /**
   * Orders with the following status are closed for editing
   */
  closedStatus: [
    'completed',
    'on-hold',
    'cancelled',
    'refunded',
    'processing',
    'failed'
  ],

  /**
   *
   */
  defaults: function(){
    var defaults = this.defaultCustomer();
    return _.extend(defaults, {
      note: '',
      order_discount: 0
    });
  },

  /**
   *
   */
  defaultCustomer: function(){
    var default_customer;

    var customers = Radio.request('entities', 'get', {
      type : 'option',
      name : 'customers'
    }) || {};

    default_customer = customers['default'] || customers.guest;

    if(default_customer){
      return {
        customer_id : default_customer.id,
        customer    : default_customer
      };
    }
  },

  /**
   * - attach tax settings
   * - attach cart & gateways if order is open
   */
  initialize: function(){

    this.tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    }) || {};

    this.tax_rates = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax_rates'
    }) || {};

    if( this.isEditable() ){
      this.attachCart();
      this.attachGateways();
    }

    // order_discount input
    this.on({
      'change:order_discount': this.calcTotals,
      'change:status': this.isEditable
    });
  },

  /**
   *
   */
  getLocalId: function(){
    if(this.id){
      return this.id;
    }
    return this.save({}, {wait:true});
  },

  /**
   * is order editable method, sets _open true or false
   */
  isEditable: function(){
    this._open = !_.contains(this.closedStatus, this.get('status'));
    return this._open;
  },

  /**
   * Remove items from cart before destroy
   */
  destroy: function(options){
    if(this.cart.length > 0){

      this.cart.indexedDB.removeBatch( this.cart.pluck('local_id') );
      //_.invoke( this.cart.toArray(), 'destroy' );
    }
    return DualModel.prototype.destroy.call(this, options);
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

    cart.order_id = this.id;

    this.listenTo(cart, {
      'add change' : this.calcTotals,
      'remove'     : this.itemRemoved
    });

    if(cart.indexedDB){
      cart.indexedDB.open().then(function(){
        cart.fetchCartItems();
      });
    }

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
   *
   */
  itemRemoved: function(){
    if(this.cart.length > 0){
      return this.calcTotals();
    }
    return this.destroy();
  },

  /**
   * Sum cart totals
   * todo: too many statements
   */
  /* jshint -W071 */
  calcTotals: function(){
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

    this.save(totals);
    debug('update totals', totals);
  },
  /* jshint +W071 */

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
    this.processGateway();
    this.serverSync();
  },

  /**
   *
   */
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
      fee_lines     : obj.fee,
      tax_lines     : this.cart.itemizedTax() // reset for retry
    });
  },

  /**
   *
   */
  processGateway: function(){
    var data = this.gateways.findWhere({ active: true }).toJSON();
    this.set({
      payment_details: data
    });
  }

});