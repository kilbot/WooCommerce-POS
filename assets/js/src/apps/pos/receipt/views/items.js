var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-items').html() ),

  initialize: function(options){
    options = options || {};
    this.order = options.order;
  },

  templateHelpers: function(){
    var order = this.order.toJSON();
    return _.union(order.line_items, order.shipping_lines, order.fee_lines);
  }
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);