var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/behaviors/tooltip');
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
    close    : 'a[data-action="close"]'
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
    }
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.request('router', 'add:to:cart', {model: this.model});
  },

  variationsPopover: function(e){
    e.preventDefault();

    var view = new Variations({
      model: this.model
    });

    this.listenTo(view, 'add:to:cart', function(args){
      var product = args.collection.models[0].toJSON();
      Radio.request('router', 'add:to:cart', product);
      Radio.request('popover', 'close');
    });

    var options = _.extend({
      view      : view,
      target    : e.target,
      position  : 'right middle'
    }, view.popover);

    Radio.request('popover', 'open', options);
  },

  variationsDrawer: function(e){
    e.preventDefault();
    var options = {};

    var name = $(e.target).data('name');
    if(name){
      options.filter = {
        name: name,
        option: $(e.target).text()
      };
    }

    this.trigger('toggle:drawer', options);
  },

  templateHelpers: function(){
    var variations = this.model.getVariations();
    var data = variations ? {
      price: variations.superset().range('price'),
      sale_price: variations.superset().range('sale_price'),
      regular_price: variations.superset().range('regular_price'),
      product_variations: this.model.productVariations()
    } : {} ;
    data.product_attributes = this.model.productAttributes();
    return data;
  }

});

module.exports = Item;
App.prototype.set('POSApp.Products.Item', Item);