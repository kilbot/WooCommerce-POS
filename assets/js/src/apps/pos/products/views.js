var Views = {};
var LayoutView = require('lib/config/layout-view');
var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var Filter = require('lib/components/filter/behavior');
var InfiniteScroll = require('lib/components/infinite-scroll/behavior');
var hbs = require('handlebars');
var $ = require('jquery');

/**
 * Products module layout
 */
Views.Layout = LayoutView.extend({
  template: hbs.compile('' +
    '<div class="list-actions"></div>' +
    '<div class="list-tabs tabs infinite-tabs"></div>' +
    '<div class="list"></div>' +
    '<div class="list-footer"></div>'
  ),
  tagName: 'section',
  regions: {
    actionsRegion   : '.list-actions',
    tabsRegion      : '.list-tabs',
    listRegion      : '.list'
  },
  attributes: {
    'class'         : 'module products-module'
  }
});

/**
 * Filter
 */
Views.Actions = ItemView.extend({
  initialize: function(){
    this.template = hbs.compile( $('#tmpl-products-filter').html() );
  },
  behaviors: {
    Filter: {
      behaviorClass: Filter
    }
  },
  ui: {
    sync: 'a[data-action="sync"]'
  },
  triggers: {
    'click @ui.sync': 'sync:products'
  }
});

/**
 * Single Product
 */
Views.Item = ItemView.extend({
  tagName: 'li',
  initialize: function(){
    this.template = hbs.compile( $('#tmpl-product').html() );
  },
  className: function(){
    if( this.model.get('type') === 'variable' ) {
      return 'variable';
    }
  },

  ui: {
    add       : 'a[data-action="add"]',
    variations: 'a[data-action="variations"]'
  },

  triggers: {
    'click @ui.add'         : 'add:to:cart',
    'click @ui.variations'  : 'show:variations'
  }

});

/**
 * Product Collection
 */
Views.Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: '#tmpl-products-empty'
});

Views.List = InfiniteListView.extend({
  tagName: 'ul',
  className: 'striped',
  childView: Views.Item,
  emptyView: Views.Empty,

  behaviors: {
    InfiniteScroll: {
      behaviorClass: InfiniteScroll
    }
  }
});

/**
 * export Product views
 */
module.exports = Views;