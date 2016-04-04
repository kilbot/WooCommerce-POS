var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var Variation = require('./variation');
var polyglot = require('lib/utilities/polyglot');

var Empty = ItemView.extend({
  className: 'empty',
  template: function(){
    return polyglot.t('messages.no-products');
  }
});

module.exports = CollectionView.extend({
  childView: Variation,
  emptyView: Empty,
  className: 'variations',
  attributes: {
    style: 'display:none' // start drawer closed
  },

  onShow: function() {
    this.$el.slideDown(250);
  }

});