var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');
var Radio = require('backbone.radio');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-totals').html() ),

  initialize: function(){
    this.tax = Radio.request('entities', 'get', {
      type : 'option',
      name : 'tax'
    }) || {};
  },

  templateHelpers: function(){

    var data = {
      subtotal: this.subtotal(),
      cart_discount: this.cartDiscount()
    };

    if( this.tax.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.cart_discount = this.model.get('subtotal') - this.model.get('total');
      data.incl_tax = true;
    }

    // itemized
    data.itemized = this.tax.tax_total_display === 'itemized';

    return data;
  },

  subtotal: function(){
    var fees = _.pluck( this.model.get('fee_lines'), 'total' );
    var fee_sum = _.reduce(fees, function(a, b){
      return parseFloat(a) + parseFloat(b);
    }, 0);
    return fee_sum + this.model.sum(['subtotal', 'total_shipping']);
  },

  /**
   * note: WC 2.3 removed cart_discount, made it total_discount
   */
  cartDiscount: function(){
    return this.model.get('cart_discount') || this.model.get('total_discount');
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Totals', View);