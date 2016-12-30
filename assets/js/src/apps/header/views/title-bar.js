var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var Dropdown = require('lib/behaviors/dropdown');
var Radio = require('backbone.radio');
var $ = require('jquery');
var HelpModal = require('./help');
var HotKeys = require('lib/behaviors/hotkeys');

var View = ItemView.extend({
  template: 'header',

  initialize: function(){
    var store = Radio.request('entities', 'get', {
      type: 'option',
      name: 'store'
    });
    this.mergeOptions(store, ['name']);
  },

  templateHelpers: function(){
    return {
      name: this.name
    };
  },

  ui: {
    'menu': '#menu-btn'
  },

  events: {
    'click @ui.menu': 'openMenu'
  },

  keyEvents: {
    'help': 'showHelpModal'
  },

  behaviors: {
    Dropdown: {
      behaviorClass: Dropdown,
      position: 'bottom right'
      //tetherOptions: {
      //  attachment: 'top right',
      //  targetAttachment: 'bottom right'
      //}
    },
    HotKeys: {
      behaviorClass: HotKeys
    }
  },

  update: function(str){
    var title = str ? $('#menu li.' + str).text() : this.name;
    this.$('h1').text(title);
  },

  openMenu: function(e){
    e.preventDefault();
    Radio.request('header', 'open:menu');
  },

  showHelpModal: function() {
    var view = new HelpModal();
    Radio.request('modal', 'open', view);
  }

});

module.exports = View;
App.prototype.set('HeaderApp.Views.TitleBar', View);