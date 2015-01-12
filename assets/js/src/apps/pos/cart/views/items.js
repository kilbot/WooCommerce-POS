var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');

var emptyView = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: '#tmpl-cart-empty'
});

module.exports = CollectionView.extend({
  tagName: 'ul',
  childView: require('./line/layout'),
  emptyView: emptyView
});