var DualModel = require('lib/config/dual-model');
var Cart = require('../cart/collection');
var _ = require('lodash');
var debug = require('debug')('order');
var Radio = require('backbone.radio');
var Utils = require('lib/utilities/utils');
var App = require('lib/config/application');

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
    this.tax_rates = _.clone( this.getSettings( 'tax_rates' ) );
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
      this.save(); // note don't pass arguments
    }, this );
  },

  /**
   *
   */
  save: function(attributes, options){
    if( this.cart && this.cart.length === 0 ){
      return this.destroy( options );
    }

    this.updateTotals();
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
    }

    return resp;
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
  }

});