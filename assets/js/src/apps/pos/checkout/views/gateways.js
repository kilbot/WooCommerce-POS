var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Gateway = require('./gateways/layout');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var EmptyView = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: function(){
    return polyglot.t('messages.no-gateway');
  }
});

var View = CollectionView.extend({
  tagName: 'ul',
  childView: Gateway,
  emptyView: EmptyView
});

module.exports = View;
App.prototype.set('POSApp.Checkout.Views.Gateways', View);