var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var Radio = require('backbone.radio');

var Item = ItemView.extend({
  template: 'pos.products.product',

  className: 'list-row',

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
App.prototype.set('POSApp.Products.Item.Drawer.Variation', Item);