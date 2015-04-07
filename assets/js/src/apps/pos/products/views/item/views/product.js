var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/components/tooltip/behavior');
var Radio = require('backbone.radio');
var Variations = require('./popover/variations');

var Item = ItemView.extend({
  template: hbs.compile( $('#tmpl-product').html() ),

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

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip,
      html: true
    }
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.command('router', 'add:to:cart', {model: this.model});
  },

  variationsPopover: function(e){
    e.preventDefault();

    var view = new Variations({
      model: this.model
    });

    this.listenTo(view, 'add:to:cart', function(args){
      var product = args.collection.models[0].toJSON();
      Radio.command('router', 'add:to:cart', product);
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

    var slug = $(e.target).data('variation');
    if(slug){
      options.filter = {
        slug: slug,
        option: $(e.target).text()
      };
    }

    this.trigger('toggle:drawer', options);
  },

  templateHelpers: function(){
    var data = {};
    if(this.model.get('type') === 'variable'){
      data.price = this.model.range('price');
      data.sale_price = this.model.range('sale_price');
      data.regular_price = this.model.range('regular_price');
      data.product_variations = this.model.productVariations();
    }
    data.product_attributes = this.model.productAttributes();
    return data;
  }

});

module.exports = Item;
POS.attach('POSApp.Products.Item', Item);