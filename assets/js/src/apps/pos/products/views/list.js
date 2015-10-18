var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var Item = require('./item/layout');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: function(){
    return polyglot.t('messages.no-products');
  }
});

var List = InfiniteListView.extend({
  childView: Item,
  emptyView: Empty,
  childViewContainer: 'ul'
});

module.exports = List;
App.prototype.set('POSApp.Products.List', List);