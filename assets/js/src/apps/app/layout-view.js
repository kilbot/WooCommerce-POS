var LayoutView = require('lib/config/layout-view');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');

module.exports = LayoutView.extend({
  el: '#page',

  template: function(){
    return '' +
      '<header id="header"></header>' +
      '<div id="menu"></div>' +
      '<div id="tabs"></div>' +
      '<main id="main"></main>';
  },

  regions: {
    header: '#header',
    menu  : '#menu',
    tabs  : '#tabs',
    main  : '#main'
  },

  initialize: function(){
    this.getRegion('main').on('show', this.onMainShow, this);
    globalChannel.on('tab:label', this.updateTabLabel, this);
  },

  onMainShow: function(layout){
    if(layout.columns && layout.columns.length === 2){
      this.$el.addClass('two-column');
      this.showTabs();
    } else {
      this.$el.removeClass('two-column');
      this.getRegion('tabs').empty();
    }
  },

  showTabs: function(){
    var tabs = Radio.request('tabs', 'view', {
      collection : [
        { id: 'left', active: true },
        { id: 'right' }
      ],
      activeId: 'left'
    });

    this.listenTo( tabs, 'childview:click', function(tab){
      this.toggleLayout( tab.model.id );
    });

    this.getRegion('main').tabs = tabs;
    this.getRegion('tabs').show(tabs);
  },

  toggleLayout: function(id){
    this.getRegion('main').currentView.$el
      .removeClass('left-active right-active')
      .addClass(id + '-active');
  },

  updateTabLabel: function(options){
    this.getRegion('tabs').currentView.setLabel(options);
  }

});