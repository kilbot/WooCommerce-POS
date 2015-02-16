var Service = require('lib/config/service');
var TitleBar = require('./views/title-bar');
var Menu = require('./views/menu');
var Tabs = require('lib/components/tabs/view');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var Radio = require('backbone.radio');
var routerChannel = Radio.channel('router');

var Service = Service.extend({
  channelName: 'header',

  initialize: function(options) {
    options = options || {};
    this.header = options.headerContainer;
    this.menu = options.menuContainer;
    this.tabs = options.tabsContainer;

    this.listenTo(routerChannel, {
      'before:enter': this.onBeforeEnter
    });

    this.channel.comply({
      'update:title': this.updateTitle,
      'update:tab'  : this.updateTabs
    }, this);
  },

  onStart: function(){
    this.showTitleBar();
    this.showMenu();
  },

  onBeforeEnter: function(router){
    this.tabs.empty();
    if(router.columns){
      this.showTabs();
    }
  },

  showTitleBar: function(){
    var view = new TitleBar();
    this.header.show(view);
  },

  updateTitle: function(title){
    this.header.currentView.update(title);
  },

  showMenu: function(){
    var view = new Menu();

    this.channel.comply({
      'open:menu'   : view.open,
      'close:menu'  : view.close
    }, view);

    this.menu.show(view);
  },

  showTabs: function(){
    var view = new Tabs({
      collection: [{id: 'left'}, {id: 'right'}]
    });

    this.listenTo(view.collection, 'change:active', function(model, active){
      if(active){
        $('#main').removeClass('left-active right-active');
        $('#main').addClass(model.id + '-active');
      }
    });

    this.tabs.show(view);
  },

  updateTabs: function(attributes){
    attributes = attributes || {};
    if(this.tabs.hasView()){
      this.tabs.currentView.collection.get(attributes.id).set(attributes);
    }
  },

  onStop: function(){
    this.channel.reset();
  }
});

module.exports = Service;
POS.attach('HeaderApp.Service', Service);