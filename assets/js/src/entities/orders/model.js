var DualModel = require('lib/config/dual-model');
var Radio = require('backbone.radio');
var Utils = require('lib/utilities/utils');
var debug = require('debug')('order');
var POS = require('lib/utilities/global');
var $ = require('jquery');

var Model = DualModel.extend({
  name: 'order',
  fields: [
    'customer.first_name',
    'customer.last_name',
    'customer.email'
  ],

  /**
   * Orders with the following status are closed for editing
   */
  //closedStatus: [
  //  'completed',
  //  'on-hold',
  //  'cancelled',
  //  'refunded',
  //  'processing',
  //  'failed'
  //],

  /**
   *
   */
  defaults: function(){
    var customers = this.getEntities('customers'),
        default_customer = customers['default'] || customers.guest || {};

    return {
      note          : '',
      order_discount: 0,
      customer_id   : default_customer.id
    };
  },

  /**
   * - attach tax settings
   * - attach cart & gateways if order is open
   */
  initialize: function(){

    this.tax = this.getEntities('tax');
    this.tax_rates = this.getEntities('tax_rates');

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

  getEntities: function(name){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: name
    }) || {};
  },

  /**
   * is order editable method, sets _open true or false
   */
  isEditable: function(){
    //return !_.contains(this.closedStatus, this.get('status'));
    return this.get('status') === undefined || this.isDelayed();
    //return this.isDelayed();
  },

  /**
   * Remove items from cart before destroy
   */
  destroy: function(options){
    var self = this;
    return this.cart.db.removeBatch( this.cart.pluck('local_id') )
      .always(function(){
        return DualModel.prototype.destroy.call(self, options);
      });
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

    if(cart.db){
      cart.db.open().then(function(){
        cart.fetchCartItems();
      });
    }

    this.cart = cart;
  },

  /**
   * remove cart items from idb after successful order
   */
  clearCart: function(){
    if(this.cart){
      this.cart.db.removeBatch( this.cart.pluck('local_id') );
    }
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

    // tax_lines will merge the data - possibly due to deep model
    // clear tax_lines before save to ensure clean data
    this.unset('tax_lines', { silent: true });

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
      sum += parseFloat( this.get(array[i]) );
    }
    return sum;
  },

  /**
   * process order
   * todo: remoteSync resolves w/ an array of models, should match sync?
   */
  process: function(){
    var self = this;

    return $.when( this.processCart() )
      .then(function(){
        return self.processGateway();
      })
      .then(function(){
        var method = self.get('id') ? 'update' : 'create';
        return self.remoteSync(method);
      })
      .then(function(array){
        var model = array[0];
        if(model.get('status') === 'failed'){
          model.save({ status: 'UPDATE_FAILED' });
        }
      });
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
      obj[type].push( model.toJSON() );
    });

    // set
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

module.exports = Model;
POS.attach('Entities.Order.Model', Model);