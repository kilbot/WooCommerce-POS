var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');

var View = ItemView.extend({
  tagName: 'ul',

  template: hbs.compile( $('#tmpl-receipt-items').html() ),

  viewOptions: ['tax_display_cart'],

  initialize: function(options){
    this.mergeOptions(options, this.viewOptions);
  },

  templateHelpers: function(){
    var data = this.model.toJSON();

    // line items
    // - add regular_price
    _.each( data.line_items, function(item) {
      item.on_sale = item.subtotal !== item.total;
      if(!item.regular_price){
        var quantity = item.quantity || 1;
        item.regular_price = parseFloat(item.subtotal) / quantity;
      }
    });

    // display including tax
    if( this.tax_display_cart === 'incl' ) {
      this._includingTax(data.line_items);
    }

    return data;
  },

  _includingTax: function(items){
    _.each( items, function(item) {
      var quantity = item.quantity || 1;
      item.subtotal = parseFloat(item.subtotal) + parseFloat(item.subtotal_tax);
      item.total = parseFloat(item.total) + parseFloat(item.total_tax);
      item.regular_price = item.subtotal / quantity;
      item.price = item.total / quantity;
    });
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);