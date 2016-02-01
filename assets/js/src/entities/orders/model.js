var DualModel = require('lib/config/dual-model');
var Cart = require('../cart/collection');
var _ = require('lodash');
var debug = require('debug')('order');
var Radio = require('backbone.radio');
var Utils = require('lib/utilities/utils');
var App = require('lib/config/application');
var Taxes = require('../tax/collection');

module.exports = DualModel.extend({
  name: 'order',

  fields: [
    'customer.first_name',
    'customer.last_name',
    'customer.email'
  ],

  defaults: {
    note : ''
  },

  /**
   * add tax settings early for use by cart
   * - cart set up during parse, parse called by constructor on new Order
   */
  constructor: function(){
    // clone tax settings
    this.tax = _.clone( this.getSettings( 'tax' ) );

    DualModel.apply( this, arguments );
  },

  /**
   * convenience method to get settings
   */
  getSettings: function(name){
    return Radio.request('entities', 'get', {
        type: 'option',
        name: name
      }) || {};
  },

  /**
   * can order be changed
   * - perhaps check an array of closed stati?
   */
  isEditable: function( status ){
    status = status || this.get('status');
    return status === undefined || this.isDelayed( status );
  },

  /**
   *
   */
  save: function(attributes, options){
    if( this.cart && this.cart.length > 0 ){
      this.updateTotals();
    }

    debug('save order', this);

    return DualModel.prototype.save.call(this, attributes, options);
  },

  /**
   * Attach cart during parse
   * - allows order to change status, ie: become editable
   */
  parse: function(resp) {
    resp = DualModel.prototype.parse.call(this, resp);

    if( resp && this.isEditable( resp.status ) && !this.cart ){
      this.attachCart( resp );
      resp.taxes = this.parseTaxRates( resp.taxes );
    }

    return resp;
  },

  /**
   * Attach cart during parse, allows updates from server
   */
  attachCart: function( attributes ){
    this.cart = new Cart( null, { order: this } );

    // add line_items, shipping_lines and fee_lines
    this.cart.set( attributes.line_items, { parse: true, remove: false } );
    this.cart.set( attributes.shipping_lines,
      { parse: true, remove: false, type: 'shipping' }
    );
    this.cart.set( attributes.fee_lines,
      { parse: true, remove: false, type: 'fee' }
    );

    //delete attributes.line_items; ?

    this.cart.on( 'change add remove', function(){
      if( this.cart && this.cart.length === 0 ){
        this.destroy();
      } else {
        this.save();
      }
    }, this );
  },

  /**
   *
   */
  /* jshint -W071 */
  toJSON: function(options) {
    var attrs = _.clone(this.attributes);

    if( this.isEditable() && this.cart ){
      var taxes = [],
          shipping_taxes = [];

      attrs.line_items = [];
      attrs.shipping_lines = [];
      attrs.fee_lines = [];

      /* jshint -W074 */
      this.cart.each( function(model) {

        switch( model.type ) {
          case 'shipping':
            attrs.shipping_lines.push( model.toJSON(options) );
            if( model.taxes ){
              shipping_taxes.push( model.taxes.toJSON() );
            }
            break;
          case 'fee':
            attrs.fee_lines.push( model.toJSON(options) );
            break;
          case 'product':
            attrs.line_items.push( model.toJSON(options) );
            break;
        }

        if( model.taxes ){
          taxes.push( model.taxes.toJSON() );
        }

      });
      /* jshint +W074 */

      attrs.tax_lines = this.mergeItemizedTaxes( taxes );
      attrs.shipping_tax = this.sumItemizedTaxes(
        this.mergeItemizedTaxes( shipping_taxes )
      );
    }

    return attrs;
  },
  /* jshint +W071 */

  /**
   * @todo this could be part of model.save( attributes )?
   */
  updateTotals: function(){
    var total         = this.cart.sum('total'),
        subtotal      = this.cart.sum('subtotal'),
        total_tax     = this.cart.sum('total_tax'),
        subtotal_tax  = this.cart.sum('subtotal_tax'),
        cart_discount = subtotal - total,
        cart_discount_tax = subtotal_tax - total_tax;

    total += total_tax;

    var totals = {
      'total'             : Utils.round( total, 4 ),
      'subtotal'          : Utils.round( subtotal, 4 ),
      'total_tax'         : Utils.round( total_tax, 4 ),
      'subtotal_tax'      : Utils.round( subtotal_tax, 4 ),
      'cart_discount'     : Utils.round( cart_discount, 4 ),
      'cart_discount_tax' : Utils.round( cart_discount_tax, 4 )
    };

    this.set(totals);
  },

  /**
   * Takes an array of itemized taxes and merges them into one combined array
   * - model.taxes.toJSON() ensures a shallow clone
   */
  mergeItemizedTaxes: function( taxes ){
    return _.reduce( taxes, function( merged, line_taxes ){
      _.each( line_taxes, function( tax ){
        var orig = _.find( merged, { rate_id: tax.rate_id } );
        if( orig ){
          orig.total = _.sum([ orig.total, tax.total ]);
          orig.subtotal = _.sum([ orig.subtotal, tax.subtotal ]);
        } else {
          merged.push( tax );
        }
      } );
      return merged;
    }) || [];
  },

  /**
   *
   */
  sumItemizedTaxes: function( taxes, attr ){
    attr = attr || 'total';
    return _.chain( taxes )
      .map( function( tax ) {
        return tax[attr];
      })
      .sum()
      .value();
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
  getDisplaySubtotal: function(){
    if( this.tax.tax_display_cart === 'incl' ) {
      return this.sum(['subtotal', 'subtotal_tax']);
    } else {
      return this.get('subtotal');
    }
  },

  /**
   * Value displayed in cart
   */
  getDisplayCartDiscount: function(){
    if( this.tax.tax_display_cart === 'incl' ) {
      return this.sum(['cart_discount', 'cart_discount_tax']);
    } else {
      return this.get('cart_discount');
    }
  },

  /**
   * Email receipt via ajax
   */
  emailReceipt: function(email){
    return App.prototype.post( this.url() + 'email/' + email );
  },

  /**
   * Clean up attached cart
   */
  destroy: function(){
    if( this.cart ){
      this.cart.reset( null, { silent: true } );
      this.cart.stopListening();
    }
    DualModel.prototype.destroy.apply(this, arguments);
  },

  /**
   * Toggle taxes
   */
  toggleTax: function( rate_id ){
    if( rate_id ){
      var val = ! this.get( 'taxes.rate_' + rate_id );
      this.set( 'taxes.rate_' + rate_id, val );
    } else {
      this.set( 'taxes.all', ! this.get( 'taxes.all' ) );
    }
  },

  /**
   * Setup tax data for this order
   * - parse tax_rates into bb Collections
   * - set enabled = true for each rate
   */
  parseTaxRates: function( enabled_taxes ){
    var tax_rates = this.getSettings( 'tax_rates' );
    this.tax_rates = {};

    // parse tax_rates
    _.each( tax_rates, function( tax_rate, tax_class ){
      var taxes = new Taxes( tax_rate, { order: this } );
      taxes.toggleTaxes( enabled_taxes );
      this.tax_rates[ tax_class ] = taxes;
    }, this);

    // exit early if attribute exists
    if( enabled_taxes ){
      return enabled_taxes;
    }

    // set enabled taxes
    return _.reduce( tax_rates, function( obj, tax_rate ){
      _.each( tax_rate, function( tax, rate_id ){
        obj[ 'rate_' + rate_id ] = true;
      } );
      return obj;
    }, { all: true } );
  },

  /**
   * Check if tax rate is enabled by rate_id
   */
  taxRateEnabled: function( rate_id ){
    if( ! this.get( 'taxes.all' ) ){
      return false;
    }
    return this.get( 'taxes.rate_' + rate_id );
  },

  /**
   * Returns parsed tax rates for a given tax_rate
   */
  getTaxRates: function( tax_class ){
    if( this.tax_rates ){
      var taxes = this.tax_rates[tax_class];
      return taxes.toJSON();
    }
  }

});