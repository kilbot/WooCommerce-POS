var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');
var Tooltip = require('lib/components/tooltip/behavior');

var Item = ItemView.extend({
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
    add        : 'a[data-action="add"]',
    variations : 'a[data-action="variations"]'
  },

  triggers: {
    'click @ui.add' : 'add:to:cart'
  },

  events: {
    'click @ui.variations' : 'onClickVariations'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip,
      html: true
    }
  },

  onClickVariations: function(e){
    e.preventDefault();
    this.trigger('show:variations', {
      target: $(e.currentTarget),
      model: this.model
    });
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