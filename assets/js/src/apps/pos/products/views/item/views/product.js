var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/behaviors/tooltip');
var Toggle = require('lib/behaviors/toggle');
var Radio = require('backbone.radio');
var Variations = require('./popover/variations');

var Item = ItemView.extend({
  template: 'pos.products.product',

  className: 'list-row',

  ui: {
    add      : 'a[data-action="add"]',
    popover  : 'a[data-action="variations"]',
    filter   : '.title ul.variations li a',
    open     : 'a[data-action="expand"]',
    close    : 'a[data-action="close"]',
  },

  events: {
    'click @ui.add'     : 'addToCart',
    'click @ui.popover' : 'variationsPopover',
    'click @ui.filter'  : 'variationsDrawer'
  },

  triggers: {
    'click @ui.open'  : 'open:drawer',
    'click @ui.close' : 'close:drawer toggle:reset'
  },

  modelEvents: {
    'change:updated_at': 'render'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip,
      html: true
    },
    Toggle: {
      behaviorClass: Toggle
    }
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.request('router', 'add:to:cart', this.model);
  },

  variationsPopover: function(e){
    e.preventDefault();
    var variations = this.model.getVariations();
    variations.resetFilters();
    this.trigger('toggle:reset');
    var view = new Variations({ collection: variations });
    var options = _.extend({
      view      : view,
      target    : e.target,
      position  : 'right middle'
    }, view.popover);
    Radio.request('popover', 'open', options);
  },

  variationsDrawer: function(e){
    e.preventDefault();
    var target = $(e.currentTarget);
    var variations = this.model.getVariations();
    variations.setVariantFilter(target.data('name'), target.text());
    this.trigger('open:drawer', {filter: true});
  },

  templateHelpers: function(){
    var data = {
      product_attributes:  this.model.getProductAttributes()
    };

    if( this.model.get('type') === 'variable' ){
      _.extend( data, {
        price: this.model.getRange('price'),
        sale_price: this.model.getRange('sale_price'),
        regular_price: this.model.getRange('regular_price'),
        product_variations: this.model.getVariationOptions()
      });
    }

    return data;
  }

});

module.exports = Item;
App.prototype.set('POSApp.Products.Item', Item);