var Service = require('lib/config/service');
var TitleBar = require('./views/title-bar');
var Menu = require('./views/menu');
var Tabs = require('lib/components/tabs/view');
var POS = require('lib/utilities/global');

var Service = Service.extend({
  channelName: 'header',

  initialize: function(options) {
    options = options || {};
    this.header = options.headerContainer;
    this.menu = options.menuContainer;
    this.tabs = options.tabsContainer;
    this.start();
  },

  onStart: function(){
    this.showTitleBar();
    this.showMenu();
    this.showTabs();
  },

  showTitleBar: function(){
    var view = new TitleBar();

    this.channel.comply({
      'update:title': view.update
    }, view);

    this.header.show(view);
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

    this.channel.comply({
      'update:tab' : function(attributes){
        attributes = attributes || {};
        view.collection.get(attributes.id).set(attributes);
      }
    }, view);

    this.listenTo(view.collection, 'change:active', function(model, active){
      if(active){
        $('#main').removeClass('left-active right-active');
        $('#main').addClass(model.id + '-active');
      }
    });

    this.tabs.show(view);
  },

  onStop: function(){
    this.channel.reset();
  }
});

module.exports = Service;
POS.attach('HeaderApp.Service', Service);