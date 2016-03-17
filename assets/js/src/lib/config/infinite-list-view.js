var Mn = require('backbone.marionette');
var _ = require('lodash');

module.exports = Mn.CompositeView.extend({

  _page: 0,

  className: 'list-infinite',

  template: function(){
    return '<div></div><ul></ul><div><i class="icon-spinner"></i></div>';
  },

  constructor: function(){
    Mn.CompositeView.apply(this, arguments);
    this.listenTo(this.collection, {
      'loading:start': this.startLoading,
      'loading:end'  : this.endLoading,
      reset          : this.reset
    });
  },

  onShow: function () {
    this.container = this.$el.parent()[0];
    this.$el.parent().on('scroll', _.throttle(this.onScroll.bind(this), 1000/60));
    this.appendNextPage();
  },

  onScroll: function(){
    if(!this.loading && this.collection.length < this.collection.db.length && this.triggerEvent()){
      this.appendNextPage();
    }
  },

  /**
   * Is user scrolling down && overflow < 100
   * - added clientHeight check to prevent false trigger when div not drawn
   * @returns {boolean}
   */
  triggerEvent: function () {
    var sH = this.container.scrollHeight,
        cH = this.container.clientHeight,
        sT = this.container.scrollTop;
    var down = sT > (this._sT || 0);
    this._sT = sT;

    return down && (sH - cH - sT < 100);
  },

  appendNextPage: function () {
    var collection = this.collection, page = ++this._page;
    collection.trigger('loading:start');

    return collection.fetch({
      remove: false,
      data: { page: page }
    })
    .then(function () {
      collection.trigger('loading:end');
    });
  },

  startLoading: function () {
    this.loading = true;
    this.$el.addClass('loading');
  },

  endLoading: function () {
    this.loading = false;
    this.$el.removeClass('loading');
  },

  reset: function(){
    this._page = 1;
  }
});