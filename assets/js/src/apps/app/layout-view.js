var LayoutView = require('lib/config/layout-view');
var $ = require('jquery');
var _ = require('lodash');
var Radio = require('backbone.radio');
var globalChannel = Radio.channel('global');
var HelpModal = require('./modals/help');
var Combokeys = require('combokeys');

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

  keyEvents: {
    'help': 'showHelpModal'
  },

  initialize: function(){
    this.getRegion('main').on('show', this.onMainShow, this);
    globalChannel.on('tab:label', this.updateTabLabel, this);
  },

  onMainShow: function(layout){
    if(layout.columns && layout.columns === 2){
      this.$el.addClass('two-column');
      this.showTabs();
    } else {
      this.$el.removeClass('two-column');
      this.getRegion('tabs').empty();
    }
  },

  onShow: function(){
    var hotkeys = Radio.request('entities', 'get', {
        type: 'option',
        name: 'hotkeys'
      }) || {};

    var combokeys = new Combokeys(document.documentElement);
    _.each( this.keyEvents, function(callback, id) {
      var trigger = hotkeys[id];
      if ( !_.isFunction(callback) ) {
        callback = this[callback];
      }
      combokeys.bind(trigger.key, function(e, combo){
        callback.call(this, e, combo);
      });
    }, this);
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
  },

  showHelpModal: function() {
    var view = new HelpModal();
    Radio.request('modal', 'open', view);
  }

});