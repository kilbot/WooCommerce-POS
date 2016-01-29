var Model = require('./abstract');
var _ = require('lodash');
var Utils = require('lib/utilities/utils');
var debug = require('debug')('productCartItem');

/**
 * Whitelist of attributes taken from product model
 */
var productAttributes = [
  'product_id',
  'name',
  'type',
  'price',
  'item_price',
  'regular_price',
  'taxable',
  'tax_status',
  'tax_class',
  'attributes',
  'quantity',
  'meta' // variation meta
];

module.exports = Model.extend({

  type: 'product',

  defaults: {
    quantity: 1
  },

  initialize: function(){
    Model.prototype.initialize.apply( this, arguments );

    // additional product listeners
    this.on( 'change:quantity change:regular_price', this.updateTotals );
  },

  /* jshint -W071 */
  updateTotals: function(){
    var quantity          = this.get('quantity'),
        item_price        = this.get('item_price'),
        regular_price     = this.get('regular_price'),
        total             = item_price * quantity,
        subtotal          = regular_price * quantity,
        total_tax         = 0,
        subtotal_tax      = 0;

    // calc total and subtotal taxes
    if( this.taxes ){
      total_tax = this.taxes.calcTaxes(item_price, quantity, 'total');
      subtotal_tax = this.taxes.calcTaxes(regular_price, quantity, 'subtotal');
    }

    // if price does not include tax
    if( this.tax_options.prices_include_tax === 'yes' ) {
      subtotal -= subtotal_tax;
      total -= total_tax;
    }

    // create totals object
    var totals = {
      'subtotal'          : Utils.round( subtotal, 4 ),
      'subtotal_tax'      : Utils.round( subtotal_tax, 4 ),
      'total_tax'         : Utils.round( total_tax, 4 ),
      'total'             : Utils.round( total, 4 )
    };

    this.set(totals);
    debug('update cart item', this);
  },
  /* jshint +W071 */

  // parsing Product Model to Cart Model
  /* jshint -W074 */
  parse: function( attributes ){
    attributes = attributes || {};
    if( attributes.product_id ){
      return attributes; // already in the right format
    }

    var attrs = _.extend( attributes, {
      product_id    : attributes.id,
      name          : attributes.title,
      item_price    : parseFloat( attributes.price || 0 ),
      regular_price : parseFloat( attributes.regular_price || 0 )
    } );

    // turn variation attributes into line item meta
    if(attributes.type === 'variation'){
      attrs.meta = _.map(attributes.attributes, function(variant, idx){
        return {
          key: ++idx,
          label: variant.name,
          value: variant.option
        };
      });
    }

    // return subset of attributes
    return _.pick(attrs, productAttributes);
  },
  /* jshint +W074 */

  /*
   * Convenience method to increase or decrease quantity
   */
  quantity: function( type ) {
    var quantity = this.get('quantity');
    this.set('quantity', (type === 'increase' ? ++quantity : --quantity) );
    return this;
  }

});