var ItemView = require('lib/config/item-view');
var Tmpl = require('./variations.hbs');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var _ = require('lodash');
var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

// rough calculation of variation option size
var hasManyOptions = function(variation){
  var opts = variation.options.length,
    chars = variation.options.reduce(function(total, opt){
      return total + opt.length;
    }, 0);
  return (opts * 26) + (chars * 5) > 220;
};

var Variations = ItemView.extend({
  template: hbs.compile(Tmpl),

  popover: {
    className: 'popover popover-variations popover-dark-bg'
  },

  initialize: function(){
    this.collection = this.model.getVariations();
    this.collection.resetFilters();
  },

  templateHelpers: function(){
    var data = {};
    data.variations = _.chain(this.model.get('attributes'))
      .where({variation:true})
      .sortBy(function(variation){
        if(hasManyOptions(variation)){
          variation.select = true;
          variation.emptyOption = polyglot.t('messages.choose');
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

  events: {
    'click @ui.btn'     : 'onVariationSelect',
    'change @ui.select' : 'onVariationSelect'
  },

  onVariationSelect: function(e){
    var target = $(e.currentTarget);

    // toggle
    if( target.is('button') ){
      target
        .addClass('active')
        .siblings('.btn')
        .removeClass('active');
    }

    // filter
    var name = target.data('name');
    var option = target.val();
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