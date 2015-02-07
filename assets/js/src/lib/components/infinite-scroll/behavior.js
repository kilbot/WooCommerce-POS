var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');

var InfiniteScroll = Behavior.extend({
  _resize: true,

  initialize: function(){

  },

  onShow: function(){
    var self = this;
    this.view._parent.$el.scroll(_.throttle(function () {
      if((self.view.el.scrollHeight -
        self.view.el.clientHeight -
        this.scrollTop) < 100){
        self.view.trigger('load:more');
      }
    }, 20));
  }

});

module.exports = InfiniteScroll;
POS.attach('Behaviors.InfiniteScroll', InfiniteScroll);