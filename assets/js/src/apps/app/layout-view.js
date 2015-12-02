var LayoutView = require('lib/config/layout-view');
var $ = require('jquery');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');

module.exports = LayoutView.extend({
  el: '#page',

  template: function(){
    return '' +
      '<header id="header"></header>' +
      '<div id="menu"></div>' +
      '<div id="tabs" class="tabs"></div>' +
      '<main id="main"></main>';
  },

  regions: {
    header: '#header',
    menu  : '#menu',
    tabs  : '#tabs',
    main  : '#main'
  },

  initialize: function(){
    this.getRegion('main').on('show', this.setup, this);
    globalChannel.on('tab:label', this.updateTabLabel, this);
  },

  setup: function(layout){
    if(layout.columns && layout.columns === 2){
      this.$el.addClass('two-column');
      this.showTabs();
    } else {
      this.$el.removeClass('two-column');
      this.getRegion('tabs').empty();
    }
  },

  showTabs: function(){
    var tabs = this.getRegion('main').tabs = Radio.request('tabs', 'view', {
      tabs: [
        {id: 'left'},
        {id: 'right'}
      ]
    });
    this.listenTo(tabs.collection, 'active:tab', this.toggleLayout);
    this.getRegion('tabs').show(tabs);
  },

  toggleLayout: function(model){
    $('#main').removeClass('left-active right-active');
    $('#main').addClass(model.id + '-active');
  },

  updateTabLabel: function(options){
    this.getRegion('main').tabs.setLabel(options);
  }

});