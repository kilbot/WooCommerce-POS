var bb = require('backbone');
var Utils = require('lib/utilities/utils');
var _ = require('lodash');
var Taxes = require('../../tax/collection');
var debug = require('debug')('cartItem');

module.exports = bb.Model.extend({

  constructor: function(){
    // set attributes, parse if required
    bb.Model.apply(this, arguments);

    // copy tax info from order collection
    this.tax_options = _.get( this, ['collection', 'order', 'tax'], {} );

    // attach tax_rates collection
    if( this.tax_options.calc_tax === 'yes' ){
      this.attachTaxes({
        prices_include_tax: this.tax_options.prices_include_tax
      });
    }

    // update on change item_price
    this.on( 'change:item_price', this.updateTotals );

    // set item price on init, this wil kick off updateLineTotals
    if( this.get('item_price') === undefined ) {
      var price = parseFloat( this.get('price') );
      this.set({ 'item_price': _.isNaN(price) ? 0 : price });
    }
  },

  attachTaxes: function(options){
    this.taxes = new Taxes( [], _.extend( { line_item : this }, options ) );
    this.on( 'change:taxable change:tax_class', function(){
      this.resetTaxes();
      this.updateTotals();
    }, this );
    this.resetTaxes();
  },

  updateTotals: function(){
    var item_price = this.get('item_price'),
        item_tax   = 0;

    if( this.taxes ){
      this.taxes.calcTaxes( this.get('item_price') );
      item_tax = this.taxes.sum('total');
    }

    // if price does not include tax
    if( this.tax_options.prices_include_tax === 'yes' ) {
      item_price -= item_tax;
    }

    // create totals object
    var totals = {
      'total_tax' : Utils.round( item_tax, 4 ),
      'total'     : Utils.round( item_price, 4 )
    };

    this.set(totals);
  },

  set: function(){
    debug('update cart item', this);
    bb.Model.prototype.set.apply(this, arguments);
  },

  resetTaxes: function(){
    var tax_rates = null;

    if( this.get('taxable') ){
      tax_rates = _.get(
        this, ['collection', 'order', 'tax_rates', this.get('tax_class') ], null
      );
    }

    this.taxes.reset( tax_rates, { parse: true } );
  },

  /**
   * Convenience method to sum attributes
   */
  sum: function(array){
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += this.get(array[i]);
    }
    return Utils.round(sum, 4);
  }

});