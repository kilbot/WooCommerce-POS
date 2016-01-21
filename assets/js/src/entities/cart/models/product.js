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
  'regular_price',
  'sale_price',
  'taxable',
  'tax_status',
  'tax_class',
  'attributes',
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
        regular_price     = parseFloat( this.get('regular_price') ),
        item_tax          = 0,
        item_subtotal_tax = 0;

    // calc total and subtotal taxes
    if( this.taxes ){
      this.taxes.calcTaxes( item_price, quantity, 'total' );
      this.taxes.calcTaxes( regular_price, quantity, 'subtotal' );
      item_tax = this.taxes.sum('total');
      item_subtotal_tax = this.taxes.sum('subtotal');
    }

    // if price does not include tax
    if( this.tax_options.prices_include_tax === 'yes' ) {
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

    this.set(totals);
    debug('update cart item', this);
  },
  /* jshint +W071 */

  // parsing Product Model to Cart Model
  parse: function( attributes ){
    var attr = _.clone( attributes ) || {};
    if( attr.product_id ){
      return attr; // already in the right format
    }

    // id becomes product_id
    attr.product_id = attr.id;

    // title becomes name
    attr.name = attr.title;

    // turn variation attributes into line item meta
    if(attr.type === 'variation'){
      attr.meta = _.map(attr.attributes, function(variant, idx){
        return {
          key: ++idx,
          label: variant.name,
          value: variant.option
        };
      });
    }

    // return subset of attributes
    return _.pick(attr, productAttributes);
  },

  /*
   * Convenience method to increase or decrease quantity
   */
  quantity: function( type ) {
    var quantity = this.get('quantity');
    this.set('quantity', (type === 'increase' ? ++quantity : --quantity) );
    return this;
  }

});