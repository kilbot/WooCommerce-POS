var ItemView = require('lib/config/item-view');
var Tooltip = require('lib/components/tooltip/behavior');
var Tmpl = require('./hotkeys.hbs');
var hbs = require('handlebars');
var Radio = require('backbone.radio');
var POS = require('lib/utilities/global');
var polyglot = require('lib/utilities/polyglot');

var View = ItemView.extend({
  template: hbs.compile(Tmpl),

  initialize: function () {
    this.hotkeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    });

    this.modal = {
      header: {
        title: polyglot.t('titles.hotkeys')
      },
      footer: {
        show: false
      }
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
POS.attach('HeaderApp.Views.HelpModal', View);