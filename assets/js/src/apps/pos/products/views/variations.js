var ItemView = require('lib/config/item-view');
var Tmpl = require('./variations.hbs');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var Buttons = require('lib/components/buttons/behavior');
var Radio = require('backbone.radio');

var Variations = ItemView.extend({
  template: hbs.compile(Tmpl),

  popover: {
    className: 'popover popover-variations popover-dark-bg'
  },

  initialize: function(options){
    this.collection = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'variations'
    });
    this.collection
      .resetFilters()
      .superset()
      .getVariations(options.model);
  },

  templateHelpers: function(){
    var data = {};
    data.variations = _.chain(this.model.get('attributes'))
      .where({variation:true})
      .sortBy(function(variation){ return variation.position; })
      .value();
    return data;
  },

  ui: {
    add: '*[data-action="add"]',
    btn: '.btn-group .btn'
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
    'click @ui.btn': 'onBtnClick'
  },

  onBtnClick: function(e){
    var name = $(e.currentTarget).data('name');
    var option = $(e.currentTarget).text().toLowerCase();
    this.collection.filterBy(name, function(model){
      return _.some(model.get('attributes'), function(obj){
        return obj.name === name && obj.option === option;
      });
    });
    this.ui.add.prop('disabled', this.collection.length !== 1)
  }
});

module.exports = Variations;
POS.attach('POSApp.Products.Variations', Variations);