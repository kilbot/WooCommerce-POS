var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-totals').html() ),

  viewOptions: ['tax_display_cart', 'tax_total_display'],

  initialize: function(options){
    this.mergeOptions(options, this.viewOptions);
  },

  templateHelpers: function(){
    var data = this.model.toJSON();

    data.cart_discount = data.cart_discount || data.total_discount;
    data.itemized = this.tax_total_display === 'itemized';

    if( this.tax_display_cart === 'incl' ) {
      this._includingTax(data);
    }

    data.has_discount = 0 !== parseFloat(data.cart_discount);

    return data;
  },

  _includingTax: function(data){
    data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
    data.cart_discount = parseFloat(data.cart_discount) +
      parseFloat(this.model.get('cart_discount_tax'));
    data.shipping_lines = this._lineTax(data.shipping_lines);
    data.fee_lines = this._lineTax(data.fee_lines);
    data.incl_tax = true;
  },

  _lineTax: function(items){
    _.each( items, function(item) {
      item.total = parseFloat(item.total) + parseFloat(item.total_tax);
    });
    return items;
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Totals', View);