var ItemView = require('lib/config/item-view');
var Tmpl = require('./variations.hbs');
var App = require('lib/config/application');
var hbs = require('handlebars');
var _ = require('lodash');
var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');

// rough calculation of variation option size
var hasManyOptions = function(options){
  var opts = options.length,
      chars = options.reduce(function(total, opt){
        return total + opt.length;
      }, 0);
  return (opts * 26) + (chars * 5) > 220;
};

var Variations = ItemView.extend({
  template: hbs.compile(Tmpl),

  popover: {
    classes: 'popover-theme-arrows popover-variations'
  },

  templateHelpers: function(){
    var data = {};
    data.variations = _.each(this.collection.getVariationOptions(), function(variation){
      if(hasManyOptions(variation.options)){
        variation.select = true;
        variation.emptyOption = polyglot.t('messages.choose');
      }
    });
    return data;
  },

  ui: {
    add   : '*[data-action="add"]',
    btn   : '.btn-group .btn',
    select: 'select'
  },

  events: {
    'click @ui.btn'     : 'onVariationSelect',
    'change @ui.select' : 'onVariationSelect',
    'click @ui.add'     : 'addToCart'
  },

  collectionEvents: {
    'reset' : function(){
      this.ui.add.prop('disabled', this.collection.length !== 1);
    }
  },

  onVariationSelect: function(e){
    e.preventDefault();
    var target = $(e.target);
    this.collection.setVariantFilter(target.data('name'), target.val());
  },

  addToCart: function(){
    var self = this;
    var product = this.collection.first().toJSON();
    // special case: array of options
    _.each(product.attributes, function(variant){
      if(_.isArray(variant.option)){
        var filter = self.collection.getFilters(variant.name);
        if(filter){
          var query = _.find(filter.query, {prefix: 'attributes.option'});
          variant.option = query.query;
        }
      }
    });
    Radio.request('router', 'add:to:cart', product);
    Radio.request('popover', 'close');
  }

});

module.exports = Variations;
App.prototype.set('POSApp.Products.Variations', Variations);