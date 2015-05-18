var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-items').html() ),

  templateHelpers: function(){

    // line items
    // - add regular_price
    var line_items = this.model.get('line_items');
    _.each( line_items, function(item) {
      item.on_sale = item.subtotal !== item.total;
      item.regular_price = parseFloat(item.subtotal) / item.quantity;
    });

    //

    //

    return {
      line_items: line_items
    };

  }
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);