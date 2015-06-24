var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
//var Tooltip = require('lib/behaviors/tooltip');
var $ = require('jquery');
var hbs = require('handlebars');

var View = ItemView.extend({

  template: hbs.compile( $('script[data-id="status"]').html() ),

  attributes: {
    id: 'wc-pos-settings-status'
  },

  ui: {
    enableLegacy  : 'a[data-action="enable-legacy-server"]',
    disableLegacy : 'a[data-action="disable-legacy-server"]'
  },

  triggers: {
    'click @ui.enableLegacy'  : 'enable:legacy',
    'click @ui.disableLegacy' : 'disable:legacy'
  },

  templateHelpers: function(){
    return this.options.tests;
  }

});

module.exports = View;
POS.attach('SettingsApp.Status.View');