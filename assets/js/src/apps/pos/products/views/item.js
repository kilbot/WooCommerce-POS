var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

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

  onClickVariations: function(e){
    e.preventDefault();
    this.trigger('show:variations', {
      target: $(e.currentTarget),
      model: this.model
    });
  }

});

module.exports = Item;
POS.attach('POSApp.Products.Item', Item);