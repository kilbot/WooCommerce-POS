var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');

module.exports = LayoutView.extend({
  el: '#page',
  template: _.template( $('#page').html() ),
  regions: {
    headerRegion: '#header',
    menuRegion  : '#menu',
    tabsRegion  : '#tabs',
    mainRegion  : '#main',
    modalRegion : '#modal'
  },
  columns: function(num){
    if(num === 2){
      return this.$el.addClass('two-column');
    }
    return this.$el.removeClass('two-column');
  }
});