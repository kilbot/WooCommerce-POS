var Mn = require('backbone.marionette');
var app = require('./application');
var _ = require('lodash');

module.exports = app.prototype.InfiniteListView = Mn.CompositeView.extend({

  className: 'list-infinite',

  template: function(){
    return '<div></div><ul></ul><div><i class="icon-spinner"></i></div>';
  },


  constructor: function(){
    Mn.CompositeView.apply(this, arguments);
    _.bindAll(this, 'onScroll', 'loadMore', 'getOverflow');
  },

  onShow: function(){
    this.container = this.$el.parent()[0];
    this.$el.parent().scroll( _.throttle( this.onScroll, 250 ) );
    this.onScroll();
  },

  onScroll: function(){
    if(this.getOverflow() < 100){
      this.loadMore();
    }
  },

  /**
   * returns overflow at bottom in px
   * - added clientHeight check to prevent false trigger when div not drawn
   * @returns {number}
   */
  getOverflow: function(){
    var sH = this.container.scrollHeight,
        cH = this.container.clientHeight,
        sT = this.container.scrollTop;
    return sH - cH - sT;
  },

  loadMore: function() {
    if(this.loading){
      return;
    }
    var self = this;
    this.startLoading();
    this.collection.superset().fetch({ remote: true })
      .then(function(){
        self.endLoading();
      });
  },

  startLoading: function(){
    this.loading = true;
    this.$el.addClass('loading');
  },

  endLoading: function(){
    this.loading = false;
    this.$el.removeClass('loading');
  }

});