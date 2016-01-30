var bb = require('backbone');
var Utils = require('lib/utilities/utils');
var _ = require('lodash');
var Taxes = require('../../tax/collection');
var debug = require('debug')('cartItem');

module.exports = bb.Model.extend({

  constructor: function( attributes, options ){
    // always parse attributes by default
    options = _.defaults( { parse: true }, options );
    bb.Model.call(this, attributes, options );
  },

  initialize: function(){
    // copy tax info from order collection
    this.tax = _.get( this, ['collection', 'order', 'tax'], {} );

    // attach tax_rates collection
    if( this.tax.calc_taxes === 'yes' ){
      this.attachTaxes();
    }

    // make sure there is an item_price
    if( this.get('item_price') === undefined ){
      this.set({ item_price: parseFloat( this.get('price') || 0 ) });
    }

    // update on change item_price
    this.on( 'change:item_price', this.updateTotals );

    // calc on init
    this.updateTotals();
  },

  /**
   *
   */
  attachTaxes: function(){
    this.taxes = new Taxes( this.getTaxRates(), {
      prices_include_tax: this.tax.prices_include_tax,
      line_item: this
    });

    this.on( 'change:taxable change:tax_class', function(){
      this.taxes.reset( this.getTaxRates() );
      this.updateTotals();
    }, this );
  },

  /* jshint -W071 */
  updateTotals: function(){
    var total       = this.get('item_price'),
        total_tax   = 0;

    if( this.taxes ){
      total_tax = this.taxes.calcTaxes( this.get('item_price') );
    }

    // if price does not include tax
    if( this.tax.prices_include_tax === 'yes' ) {
      total -= total_tax;
    }

    // create totals object
    var totals = {
      'total_tax' : Utils.round( total_tax, 4 ),
      'total'     : Utils.round( total, 4 )
    };

    debug('update cart item', this);
    this.set(totals);
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
    return Utils.round(sum, 4);
  },

  /**
   * Value displayed in cart
   */
  getDisplayTotal: function(){
    if( this.tax.tax_display_cart === 'incl' ) {
      return this.sum(['total', 'total_tax']);
    } else {
      return this.get('total');
    }
  },

  /**
   * Value displayed in cart
   */
  getDisplaySubtotal: function(){
    if( this.tax.tax_display_cart === 'incl' ) {
      return this.sum(['subtotal', 'subtotal_tax']);
    } else {
      return this.get('subtotal');
    }
  },

  /**
   * Wrapper for order.getTaxRates(), checks if line item is taxable
   */
  getTaxRates: function(){
    var tax_rates = null;
    if( this.get('taxable') ){
      tax_rates = this.collection.order.getTaxRates( this.get('tax_class') );
    }
    return tax_rates;
  },

  /**
   * Clean up attached taxes
   */
  destroy: function(){
    if( this.taxes ){
      this.taxes.reset( null, { silent: true } );
      this.taxes.stopListening();
    }
    bb.Model.prototype.destroy.apply(this, arguments);
  }

});