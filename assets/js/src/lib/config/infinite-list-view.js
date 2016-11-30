var Mn = require('backbone.marionette');
var _ = require('lodash');
var app = require('./application');

module.exports = app.prototype.InfiniteListView = Mn.CompositeView.extend({

  className: 'list-infinite',

  template: function(){
    return '<div></div><ul></ul><div><i class="icon-spinner"></i></div>';
  },

  constructor: function(){
    Mn.CompositeView.apply(this, arguments);

    this.on('show', function(){
      this.container = this.$el.parent()[0];
      this.$el.parent().on('scroll', _.throttle(this.onScroll.bind(this), 1000/60));
    });

    this.listenTo(this.collection, {
      request : this.startLoading,
      sync    : this.endLoading
    });
  },

  onScroll: function(){
    if(!this.loading && this.collection.hasMore() && this.triggerEvent()){
      this.appendNextPage();
    }
  },

  triggerEvent: function () {
    var sH = this.container.scrollHeight,
        cH = this.container.clientHeight,
        sT = this.container.scrollTop;
    var down = sT > (this._sT || 0);
    this._sT = sT;
    return down ? sH - cH - sT < 100 : sH - cH - sT <= 0;
  },

  appendNextPage: function () {
    this.collection
      .setFilter({ not_in: this.collection.map('id') })
      .fetch({ index: 'id', remove: false });
  },

  startLoading: function () {
    this.loading = true;
    this.$el.addClass('loading');
  },

  endLoading: function () {
    this.loading = false;
    this.$el.removeClass('loading');
    this.onScroll();
  }
});