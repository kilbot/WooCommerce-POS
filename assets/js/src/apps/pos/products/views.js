var Views = {};
var LayoutView = require('lib/config/layout-view');
var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Filter = require('lib/components/filter/behavior');
var hbs = require('handlebars');
var _ = require('underscore');
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
    add: '.action-add',
    variations: '.action-variations'
  },

  triggers: {
    'click @ui.add'         : 'cart:add:clicked',
    'click @ui.variations'  : 'product:variations:clicked'
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

Views.List = CollectionView.extend({
  tagName: 'ul',
  className: 'striped',
  childView: Views.Item,
  emptyView: Views.Empty,

  initialize: function() {
    this.collection.bind('request', this.ajaxStart, this);
    this.collection.bind('sync', this.ajaxComplete, this);
  },

  ajaxStart: function() {
    this.$el.css({ 'opacity': 0.5 });
  },

  ajaxComplete: function() {
    this.$el.removeAttr('style');
  }

});

/**
 * export Product views
 */
module.exports = Views;