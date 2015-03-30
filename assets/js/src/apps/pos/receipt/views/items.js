var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-items').html() ),

  initialize: function(options){
    options = options || {};
    this.order = options.order;
  },

  templateHelpers: function(){
    var order = this.order.toJSON();
    return order.line_items
      .concat(order.fee_lines)
      .concat(order.shipping_lines);
  }
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);