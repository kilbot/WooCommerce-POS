var bb = require('backbone');
var Model = require('./model');
var _ = require('lodash');

module.exports = bb.Collection.extend({

  model: Model,

  /**
   * attach line_item early for use by parse
   * - always parse
   */
  constructor: function( models, options ){
    options = _.extend({}, options, { parse: true });
    this.line_item = options.line_item;

    // set calcTaxes method
    if( options.prices_include_tax === 'yes' ){
      this.calcTaxes = this.calcInclusiveTax;
    } else {
      this.calcTaxes = this.calcExclusiveTax;
    }

    bb.Collection.call(this, models, options);
  },

  /**
   *
   */
  initialize: function( models, options ){
    this.order = options.order || _.get(this.line_item, ['collection', 'order']);
  },

  /**
   * Calculate the line item tax total
   * based on the calc_exclusive_tax function in
   * woocommerce/includes/class-wc-tax.php
   */
  calcExclusiveTax: function( price, qty, attr ){
    var pre_compound_total = 0,
        taxes = {};

    // defaults
    qty = qty || 1;
    attr = attr || 'total';

    // multiple taxes
    this.each(function(tax) {
      if( ! tax.get('compound') ) {
        taxes[ tax.id ] = price * tax.getRate();
      }
    }, this);

    pre_compound_total = _.reduce( taxes, function( sum, num ){
      return sum + num;
    }, 0 );

    // compound taxes
    this.each(function(tax) {
      if ( tax.get('compound') ) {
        taxes[ tax.id ] = ( price + pre_compound_total ) * tax.getRate();
      }
      tax.set( attr, ( taxes[ tax.id ] * qty ) );
    }, this);

    return this.sum( attr );
  },

  /**
   * Calculate the line item tax total
   * based on the calc_inclusive_tax function in
   * woocommerce/includes/class-wc-tax.php
   */
  calcInclusiveTax: function( price, qty, attr ){
    var regular_tax_rates  = 0,
        compound_tax_rates = 0,
        non_compound_price = 0;

    // defaults
    qty = qty || 1;
    attr = attr || 'total';

    this.each(function(tax) {
      if ( tax.get('compound') ) {
        compound_tax_rates += tax.getRate();
      } else {
        regular_tax_rates += tax.getRate();
      }
    }, this);

    non_compound_price = price / ( 1 + compound_tax_rates );

    this.each(function(tax) {
      var the_rate = tax.getRate();
      var the_price = 0;

      if ( tax.get('compound') ) {
        the_price = price;
        the_rate  = the_rate / ( 1 + compound_tax_rates );
      }  else {
        the_price = non_compound_price;
        the_rate  = the_rate / ( 1 + regular_tax_rates );
      }

      tax.set( attr, ( the_rate * the_price * qty ) );
    }, this);

    return this.sum( attr );
  },

  /**
   * move rate_id key to part of rate model
   */
  parse: function( rates ){
    if( _.isArray( rates ) ){
      return rates; // already parsed
    }
    var type = _.get( this, ['line_item', 'type'] );

    return _.chain(rates)
      .map(function( rate, rate_id ){
        rate.rate_id = rate_id;
        // remove tax rates for shipping = 'no'
        if( type !== 'shipping' || rate.shipping !== 'no' ){
          return rate;
        }
      })
      .compact()
      .value();
  },

  /**
   * convenience method to sum taxes
   */
  sum: function(attribute){
    var collection = this;
    return this.reduce( function( sum, model ){
      if( collection.order.taxRateEnabled(model.id) ){
        return sum + parseFloat( model.get(attribute) );
      }
      return sum;
    }, 0 );
  },

  /**
   * Always parse on reset
   */
  reset: function( models, options ){
    options = _.extend({}, options, { parse: true });
    bb.Collection.prototype.reset.call( this, models, options );
  }

});