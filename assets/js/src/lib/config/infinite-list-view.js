var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var $ = require('jquery');

module.exports = POS.InfiniteListView = Mn.CompositeView.extend({
  className: 'infinite-list',
  template: function(){
    return '<div><i class="icon icon-pull-arrow"></i>' +
      '<i class="icon icon-spinner"></i></div>' +
      '<ul class="striped"></ul>' +
      '<div><i class="icon icon-spinner"></i></div>';
  },

  initialize: function(){
    _.bindAll(this, 'loadMore');
  },

  // Marionette's default implementation ignores the index, always
  // appending the new view to the end. Let's be a little more clever.
  appendHtml: function(collectionView, itemView, index){
    if (!index) {
      collectionView.$el.prepend(itemView.el);
    } else {
      $(collectionView.$('li')[index - 1]).after(itemView.el);
    }
  },

  onShow: function(){
    this._parent.$el.scroll(this.onScroll);
    this._parent.$el.on('load:more', this.loadMore);
  },

  onScroll: _.throttle(function(e){
    var sH = e.target.scrollHeight,
        cH = e.target.clientHeight,
        sT = e.target.scrollTop;

    if((sH - cH - sT) < 100){
      $(e.target).trigger('load:more');
    }
  }, 20),

  loadMore: function(){
    if(this.collection.hasNextPage()){
      this.collection.appendNextPage();
    }
  }

});