var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Gateway = require('./gateways/layout');
var App = require('lib/config/application');

var EmptyView = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: 'pos.checkout.tmpl-empty'
});

var View = CollectionView.extend({
  tagName: 'ul',
  childView: Gateway,
  emptyView: EmptyView
});

module.exports = View;
App.prototype.set('POSApp.Checkout.Views.Gateways', View);