var DualModel = require('lib/config/dual-model');
var Cart = require('../cart/collection');
var _ = require('lodash');
var debug = require('debug')('order');
var Radio = require('backbone.radio');

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

  initialize: function(){
    // clone tax settings
    this.tax = _.clone( this.getSettings( 'tax' ) );
    this.tax_rates = _.clone( this.getSettings( 'tax_rates' ) );
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

  save: function(attributes, options){
    if( this.cart && this.cart.length === 0 ){
      return this.destroy( options );
    }

    this.updateTotals();
    debug('save order', this);

    return DualModel.prototype.save.call(this, attributes, options);
  },

  parse: function(resp) {
    resp = DualModel.prototype.parse.call(this, resp);

    if( resp && this.isEditable( resp.status ) && !this.cart ){
      this.attachCart( resp );
    }

    return resp;
  },

  toJSON: function(options) {
    var attrs = _.clone(this.attributes);

    if( this.isEditable() && this.cart ){
      attrs.line_items = [];
      attrs.shipping_lines = [];
      attrs.fee_lines = [];

      this.cart.each( function(model) {
        if( model.type === 'shipping' ){
          attrs.shipping_lines.push( model.toJSON(options) );
        } else if ( model.type === 'fee' ) {
          attrs.fee_lines.push( model.toJSON(options) );
        } else {
          attrs.line_items.push( model.toJSON(options) );
        }
      });
    }

    return attrs;
  },

  updateTotals: function(){
    var totals = {
      total         : this.cart.sum('total'),
      subtotal      : this.cart.sum('subtotal'),
      total_tax     : this.cart.sum('total_tax'),
      subtotal_tax  : this.cart.sum('subtotal_tax')
    };

    this.set(totals);
  }

});