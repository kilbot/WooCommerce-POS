var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var Item = require('./item/layout');
var POS = require('lib/utilities/global');

var Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: 'pos.products.tmpl-empty'
});

var List = InfiniteListView.extend({
  childView: Item,
  emptyView: Empty,
  childViewContainer: 'ul'
});

module.exports = List;
POS.attach('POSApp.Products.List', List);