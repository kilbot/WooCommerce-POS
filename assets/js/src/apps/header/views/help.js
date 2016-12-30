var ItemView = require('lib/config/item-view');
var Tooltip = require('lib/behaviors/tooltip');
var Radio = require('backbone.radio');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var View = ItemView.extend({
  template: 'modals.hotkeys',

  initialize: function () {
    this.hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    });

    this.modal = {
      header: {
        title: polyglot.t('titles.hotkeys')
      },
      tabs: [
        {
          id: 1,
          label: 'Tab 1'
        },
        {
          id: 2,
          label: 'Tab 2'
        }
      ],
      footer: false
    };
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  templateHelpers: function(){
    return this.hotkeys;
  }

});

module.exports = View;
App.prototype.set('HeaderApp.Views.HelpModal', View);