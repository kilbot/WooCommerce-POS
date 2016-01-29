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
    this.tax_options = _.get( this, ['collection', 'order', 'tax'], {} );

    // attach tax_rates collection
    if( this.tax_options.calc_taxes === 'yes' ){
      this.attachTaxes({
        prices_include_tax: this.tax_options.prices_include_tax
      });
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
   * @todo init with saved itemized taxes?
   */
  attachTaxes: function(options){
    this.taxes = new Taxes(
      this.getTaxesRates(),
      _.extend( { parse: true, line_item : this }, options )
    );

    this.on( 'change:taxable change:tax_class', function(){
      this.taxes.reset( this.getTaxesRates(), { parse: true } );
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
    if( this.tax_options.prices_include_tax === 'yes' ) {
      total -= total_tax;
    }

    // create totals object
    var totals = {
      'total_tax' : Utils.round( total_tax, 4 ),
      'total'     : Utils.round( total, 4 )
    };

    this.set(totals);
    debug('update cart item', this);
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
    if( this.tax_options.tax_display_cart === 'incl' ) {
      return this.sum(['total', 'total_tax']);
    } else {
      return this.get('total');
    }
  },

  /**
   * Value displayed in cart
   */
  getDisplaySubtotal: function(){
    if( this.tax_options.tax_display_cart === 'incl' ) {
      return this.sum(['subtotal', 'subtotal_tax']);
    } else {
      return this.get('subtotal');
    }
  },

  getTaxesRates: function(){
    if( this.get('taxable') ){
      return _.get(
        this, ['collection', 'order', 'tax_rates', this.get('tax_class') ], null
      );
    }
    return null;
  }

});