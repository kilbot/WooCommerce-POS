var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var LineItem = require('./line/layout');
var POS = require('lib/utilities/global');

var Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: '#tmpl-cart-empty'
});

var View = CollectionView.extend({
  tagName: 'ul',
  childView: LineItem,
  emptyView: Empty
});

module.exports = View;
POS.attach('POSApp.Cart.Views.Items', View);