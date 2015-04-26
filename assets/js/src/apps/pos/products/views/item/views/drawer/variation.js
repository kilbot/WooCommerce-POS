var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var Radio = require('backbone.radio');

var Item = ItemView.extend({
  template: hbs.compile( $('#tmpl-product').html() ),
  className: 'variation',

  ui: {
    add : 'a[data-action="add"]'
  },

  events: {
    'click @ui.add' : 'addToCart'
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.command('router', 'add:to:cart', {model: this.model});
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