var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/behaviors/tooltip');
var Radio = require('backbone.radio');
var Variations = require('./popover/variations');

var Item = ItemView.extend({
  template: 'pos.products.tmpl-product',

  ui: {
    add      : 'a[data-action="add"]',
    vpopover : 'a[data-action="variations"]',
    vdrawer  : '.title dl.variations dd a'
  },

  events: {
    'click @ui.add' : 'addToCart',
    'click @ui.vpopover' : 'variationsPopover',
    'click @ui.vdrawer'  : 'variationsDrawer'
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
      view   : view,
      parent : this,
      model  : this.model,
      target : $(e.currentTarget)
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
      product_variations: this.model.getVariationOptions()
    } : {} ;
    data.product_attributes = this.model.productAttributes();
    return data;
  }

});

module.exports = Item;
POS.attach('POSApp.Products.Item', Item);