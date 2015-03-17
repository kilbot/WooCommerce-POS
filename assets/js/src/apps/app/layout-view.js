var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');
var Tabs = require('lib/components/tabs/view');
var TabsCollection = require('lib/components/tabs/entities');

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
    var tabs = new TabsCollection([{id: 'left'}, {id: 'right'}]);

    this.listenTo(tabs, 'change:active', this.toggleTabs);

    this.listenTo(this.mainRegion, 'show', function(layout){
      if(layout.columns && layout.columns === 2){
        this.$el.addClass('two-column');
        this.tabsRegion.show(new Tabs({
          collection: tabs
        }));
        layout.tabs = tabs;
      } else {
        this.$el.removeClass('two-column');
        this.tabsRegion.empty();
      }
    });
  },

  toggleTabs: function(model, active){
    if(active){
      $('#main').removeClass('left-active right-active');
      $('#main').addClass(model.id + '-active');
    }
  }
});