var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');

var Item = ItemView.extend({
  template: 'pos.products.tmpl-product',

  className: 'variation',

  ui: {
    add : 'a[data-action="add"]'
  },

  events: {
    'click @ui.add' : 'addToCart'
  },

  // todo: why is this necessary?
  modelEvents: {
    'change:stock_quantity': 'render'
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.request('router', 'add:to:cart', {model: this.model});
  },

  templateHelpers: function(){
    return {
      variation: true,
      title: this.options.model.parent.get('title')
    };
  }

});

module.exports = Item;
POS.attach('POSApp.Products.Item.Drawer.Variation', Item);