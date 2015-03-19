var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');

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

  initialize: function(){
    this.mainRegion.on('show', this.setup, this);
    globalChannel.on('tab:label', this.updateTabLabel, this);
  },

  setup: function(layout){
    if(layout.columns && layout.columns === 2){
      this.$el.addClass('two-column');
      this.showTabs();
    } else {
      this.$el.removeClass('two-column');
      this.tabsRegion.empty();
    }
  },

  showTabs: function(){
    var tabs = this.mainRegion.tabs = Radio.request('tabs', 'view', {
      tabs: [
        {id: 'left'},
        {id: 'right'}
      ]
    });
    this.listenTo(tabs.collection, 'active:tab', this.toggleLayout);
    this.tabsRegion.show(tabs);
  },

  toggleLayout: function(model){
    $('#main').removeClass('left-active right-active');
    $('#main').addClass(model.id + '-active');
  },

  updateTabLabel: function(options){
    this.mainRegion.tabs.setLabel(options);
  }

});