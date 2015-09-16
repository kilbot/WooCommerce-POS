var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Variation = require('./variation');
var _ = require('lodash');

var Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: 'pos.products.tmpl-empty'
});

module.exports = CollectionView.extend({
  childView: Variation,
  emptyView: Empty,
  childViewContainer: 'ul',

  initialize: function(options){
    options = options || {};

    this.collection = this.model.getVariations();
    this.collection.resetFilters();
    this.filterVariations(options.filter);
  },

  onShow: function() {
    this.$el.hide().slideDown(250);
  },

  filterVariations: function(filter){
    if(filter){
      filter = filter || {};
      var matchMaker = function(model){
        var attributes = model.get('attributes');
        return _.any(attributes, function(attribute){
          return attribute.name === filter.name &&
            attribute.option === filter.option;
        });

      };
      this.collection.filterBy('variation', matchMaker);
    }
  }

});