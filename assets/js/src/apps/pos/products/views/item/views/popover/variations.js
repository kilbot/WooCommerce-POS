var ItemView = require('lib/config/item-view');
var Tmpl = require('./variations.hbs');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var Buttons = require('lib/components/buttons/behavior');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');

// rough calculation of variation option size
var hasManyOptions = function(variation){
  var opts = variation.options.length,
      chars = variation.options.reduce(function(total, opt){
          return total + opt.length;
      }, 0);
  return (opts * 26) + (chars * 5) > 250;
};

var emptyOption = function(){
  var messages = Radio.request('entities', 'get', {
    type: 'option',
    name: 'messages'
  });
  return messages.choose;
};

var Variations = ItemView.extend({
  template: hbs.compile(Tmpl),

  popover: {
    className: 'popover popover-variations popover-dark-bg'
  },

  initialize: function(){
    this.collection = Radio.request('entities', 'get', {
      type: 'variations',
      parent: this.model
    });
    this.collection.resetFilters();
  },

  templateHelpers: function(){
    var data = {};
    data.variations = _.chain(this.model.get('attributes'))
      .where({variation:true})
      .sortBy(function(variation){
        if(hasManyOptions(variation)){
          variation.select = true;
          variation.emptyOption = emptyOption();
        }
        return variation.position;
      })
      .value();
    return data;
  },

  ui: {
    add: '*[data-action="add"]',
    btn: '.btn-group .btn',
    select: 'select'
  },

  triggers: {
    'click @ui.add': 'add:to:cart'
  },

  behaviors: {
    Buttons: {
      behaviorClass: Buttons
    }
  },

  events: {
    'click @ui.btn'     : 'onVariationSelect',
    'change @ui.select' : 'onVariationSelect'
  },

  onVariationSelect: function(e){
    var name = $(e.currentTarget).data('name');
    var option = $(e.currentTarget).val().toLowerCase();
    this.collection.filterBy(name, function(model){
      return _.some(model.get('attributes'), function(obj){
        return obj.name === name && obj.option === option;
      });
    });
    this.ui.add.prop('disabled', this.collection.length !== 1);
  }
});

module.exports = Variations;
POS.attach('POSApp.Products.Variations', Variations);