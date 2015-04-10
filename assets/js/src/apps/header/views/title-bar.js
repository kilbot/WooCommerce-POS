var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var HotKeys = require('lib/behaviors/hotkeys');
var Dropdown = require('lib/behaviors/dropdown');
var Radio = require('backbone.radio');
var HelpModal = require('./modals/help');
var $ = require('jquery');

var View = ItemView.extend({
  template: function(){
    return $('#header > div').html();
  },

  initialize: function(){
    this.title = $('#header h1').text();
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
    HotKeys: {
      behaviorClass: HotKeys
    },
    Dropdown: {
      behaviorClass: Dropdown
    }
  },

  update: function(str){
    var title = str ? str : this.title;
    this.$('h1').text(title);
  },

  openMenu: function(e){
    e.preventDefault();
    Radio.command('header', 'open:menu');
  },

  showHelpModal: function() {
    var view = new HelpModal();
    Radio.request('modal', 'open', view);
  }

});

module.exports = View;
POS.attach('HeaderApp.Views.TitleBar', View);