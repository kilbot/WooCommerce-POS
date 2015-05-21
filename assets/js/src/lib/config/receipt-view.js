var ItemView = require('./item-view');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');
var _ = require('lodash');

/**
 * Prepare order JSON for display on receipts
 *
 * @param order
 * @param settings
 */
/* jshint  -W101, -W071, -W074 */

function prepare(order, settings){
  var data = order.toJSON();
  data.incl_tax = settings.tax_display_cart === 'incl';
  data.itemized = settings.tax_total_display === 'itemized';

  /**
   * Line Items
   */
    // - add regular_price
  _.each( data.line_items, function(item) {
    item.on_sale = item.subtotal !== item.total;
    if(!item.regular_price){
      var quantity = item.quantity || 1;
      item.regular_price = parseFloat(item.subtotal) / quantity;
    }
  });

  if( data.incl_tax ) {
    _.each( data.line_items, function(item) {
      var quantity = item.quantity || 1;
      item.subtotal = parseFloat(item.subtotal) + parseFloat(item.subtotal_tax);
      item.total = parseFloat(item.total) + parseFloat(item.total_tax);
      item.regular_price = item.subtotal / quantity;
      item.price = item.total / quantity;
    });
  }

  /**
   * Totals
   */
  if( data.itemized ){
    _.each( data.tax_lines, function(line) {
      line.has_tax = 0 !== parseFloat(line.total);
    });
  }

  // WC 2.3 changed cart_discount to total_discount
  data.cart_discount = data.cart_discount || data.total_discount;

  if( data.incl_tax ) {
    data.subtotal = order.sum(['subtotal', 'subtotal_tax']);
    data.cart_discount = parseFloat(data.cart_discount) +
    parseFloat(data.cart_discount_tax);

    _.each( data.shipping_lines, function(item) {
      item.total = parseFloat(item.total) + parseFloat(item.total_tax);
    });

    _.each( data.fee_lines, function(item) {
      item.total = parseFloat(item.total) + parseFloat(item.total_tax);
    });
  }

  data.has_tax = data.total_tax && 0 !== parseFloat(data.total_tax);
  data.has_discount = data.cart_discount && 0 !== parseFloat(data.cart_discount);
  data.has_order_discount = data.order_discount && 0 !== parseFloat(data.order_discount);

  return data;
}

module.exports = POS.ReceiptView = ItemView.extend({

  viewOptions: ['data'],

  initialize: function() {
    var tax = Radio.request('entities', 'get', {
        type: 'option',
        name: 'tax'
      }) || {};
    var data = prepare( this.model, tax );
    this.mergeOptions({ data: data }, this.viewOptions);
  },

  templateHelpers: function(){
    return this.data;
  },

  prepare: prepare

});
/* jshint  +W101, +W071, +W074 */