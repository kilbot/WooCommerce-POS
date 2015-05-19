var Model = require('lib/config/model');
var debug = require('debug')('cartItem');
var Utils = require('lib/utilities/utils');
var _ = require('lodash');
var Radio = require('backbone.radio');

module.exports = Model.extend({
  idAttribute: 'local_id',

  defaults : {
    'subtotal'      : 0,
    'subtotal_tax'  : 0,
    'total_tax'     : 0,
    'total'         : 0,
    'item_price'    : 0,
    'item_tax'      : 0,
    'quantity'      : 1,
    'taxable'       : true,
    'tax_class'     : ''
  },

  initialize: function() {

    // attach tax settings
    this.tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    }) || {};
    this.tax_rates = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax_rates'
    }) || {};

    // update on change to quantity, item_price ...
    this.on(
      'change:quantity ' +
      'change:item_price ' +
      'change:regular_price ' +
      'change:taxable ' +
      'change:tax_class',
      this.updateLineTotals );

    // set item price on init, this wil kick off updateLineTotals
    if( this.get('item_price') === 0 ) {
      this.set({ 'item_price': parseFloat( this.get('price') ) });
    }
  },

  /* jshint -W071, -W074 */
  /* todo: too many statements, too complex */
  updateLineTotals: function() {
    var quantity        = this.get('quantity'),
        item_price      = this.get('item_price'),
        type            = this.get('type'),
        regular_price   = parseFloat( this.get('regular_price')),
        tax_class       = this.get('tax_class'),
        item_tax,
        item_subtotal_tax,
        rates;

    // make a copy of the tax rates for this product
    if(this.tax_rates[tax_class]){
      rates = _.cloneDeep(this.tax_rates[tax_class]);
    }

    // if shipping or fee
    if( type === 'shipping' || type === 'fee' ) {
      regular_price = item_price;
    }

    // calc taxes
    item_tax = this.calcTax({
      price    : item_price,
      quantity : quantity,
      rates    : rates
    });

    item_subtotal_tax = this.calcTax({
      price    : regular_price,
      quantity : quantity,
      rates    : rates,
      subtotal : true
    });

    // if price does not include tax
    if( this.tax.prices_include_tax === 'yes' ) {
      regular_price -= item_subtotal_tax;
      item_price -= item_tax;
    }

    // create totals object
    var totals = {
      'item_subtotal'     : Utils.round( regular_price, 4 ),
      'item_subtotal_tax' : Utils.round( item_subtotal_tax, 4 ),
      'item_tax'          : Utils.round( item_tax, 4 ),
      'subtotal'          : Utils.round( regular_price * quantity, 4 ),
      'subtotal_tax'      : Utils.round( item_subtotal_tax * quantity, 4 ),
      'total_tax'         : Utils.round( item_tax * quantity, 4 ),
      'total'             : Utils.round( item_price * quantity, 4 )
    };

    this.save(totals);
    debug('update totals', totals);
  },
  /* jshint +W071, +W074 */

  /**
   * Calculate the line item tax total
   * based on the calc_tax function in woocommerce/includes/class-wc-tax.php
   */
  calcTax: function(options) {
    var item_tax = 0;

    if(this.tax.calc_taxes === 'yes' && this.get('taxable') && options.rates) {
      if( this.tax.prices_include_tax === 'yes' ) {
        item_tax = this.calcInclusiveTax(options);
      } else {
        item_tax = this.calcExclusiveTax(options);
      }
    } else {
      this.set('tax', undefined);
    }

    return item_tax;
  },

  /**
   * Calculate the line item tax total
   * based on the calc_inclusive_tax function in
   * woocommerce/includes/class-wc-tax.php
   */
  /* todo: too many statements */
  /* jshint -W071 */
  calcInclusiveTax: function(options) {
    var regular_tax_rates = 0,
        compound_tax_rates = 0,
        non_compound_price = 0,
        tax_amount = 0,
        item_tax = 0,
        price = options.price,
        rates = options.rates,
        qty = options.quantity;

    _.each(rates, function(rate, key) {
      if( this.get('type') === 'shipping' && rate.shipping === 'no' ){
        delete rates[key];
        return;
      }
      if ( rate.compound === 'yes' ) {
        compound_tax_rates = compound_tax_rates + parseFloat(rate.rate);
      } else {
        regular_tax_rates = regular_tax_rates + parseFloat(rate.rate);
      }
    }, this);

    var regular_tax_rate  = 1 + ( regular_tax_rates / 100 );
    var compound_tax_rate   = 1 + ( compound_tax_rates / 100 );
    non_compound_price = price / compound_tax_rate;

    _.each(rates, function(rate) {
      var the_rate = parseFloat(rate.rate) / 100;
      var the_price = 0;

      if ( rate.compound === 'yes' ) {
        the_price = price;
        the_rate  = the_rate / compound_tax_rate;
      }  else {
        the_price = non_compound_price;
        the_rate  = the_rate / regular_tax_rate;
      }

      var net_price = price - ( the_rate * the_price );
      tax_amount = price - net_price;

      // set the itemized taxes
      var prop = options.subtotal ? 'subtotal' : 'total';
      rate[prop] = Utils.round( tax_amount * qty, 4 );

      // sum item taxes
      item_tax += tax_amount;

    }, this);

    // itemized tax
    if( !_.isEmpty(rates) ){
      this.set('tax', rates);
    }

    // return the item tax
    return item_tax;
  },
  /* jshint +W071 */

  /**
   * Calculate the line item tax total
   * based on the calc_exclusive_tax function in
   * woocommerce/includes/class-wc-tax.php
   */
  calcExclusiveTax: function(options) {
    var taxes = [],
        pre_compound_total = 0,
        tax_amount = 0,
        item_tax = 0,
        price = options.price,
        rates = options.rates,
        qty = options.quantity;

    // multiple taxes
    _.each(rates, function(rate, key) {
      tax_amount = 0;
      if( this.get('type') === 'shipping' && rate.shipping === 'no' ){
        delete rates[key];
        return;
      }
      if ( rate.compound !== 'yes' ) {
        tax_amount = price * ( parseFloat(rate.rate) / 100 );
      }
      taxes[ key ] = tax_amount;
    }, this);

    if( taxes.length > 0 ) {
      pre_compound_total = taxes.reduce(function(sum, num) {return sum + num;});
    }

    // compound taxes
    _.each(rates, function(rate, key) {
      if ( rate.compound === 'yes' ) {
        var the_price_inc_tax = price + pre_compound_total;
        taxes[ key ] = the_price_inc_tax * ( parseFloat(rate.rate) / 100 );
      }

      // set the itemized taxes
      var prop = options.subtotal ? 'subtotal' : 'total';
      rate[prop] = Utils.round( taxes[ key ] * qty, 4 );

      // sum item taxes
      item_tax += taxes[ key ];

    }, this);

    // itemized tax
    if( !_.isEmpty(rates) ){
      this.set('tax', rates);
    }

    // return the item tax
    return item_tax;
  },

  // Convenience method to increase or decrease quantity
  quantity: function( type ) {
    var quantity = this.get('quantity');
    this.set('quantity', (type === 'increase' ? ++quantity : --quantity) );
    return this;
  },

  // Convenience method to sum attributes
  sum: function(array){
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += this.get(array[i]);
    }
    return Utils.round(sum, 4);
  }

});