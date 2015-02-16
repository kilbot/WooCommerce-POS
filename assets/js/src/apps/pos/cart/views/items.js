var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var LineItem = require('./line/layout');
var POS = require('lib/utilities/global');
var Items = {};

Items.Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: '#tmpl-cart-empty'
});

Items.View = CollectionView.extend({
  tagName: 'ul',
  childView: LineItem,
  emptyView: Items.Empty
});

module.exports = Items;
POS.attach('POSApp.Cart.Views.Items', Items);