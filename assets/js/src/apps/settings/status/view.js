var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var EmulateHTTP = require('lib/behaviors/emulateHTTP');
var $ = require('jquery');
var hbs = require('handlebars');

var View = ItemView.extend({

  template: hbs.compile( $('script[data-id="status"]').html() ),

  attributes: {
    id: 'wc-pos-settings-status'
  },

  behaviors: {
    EmulateHTTP: {
      behaviorClass: EmulateHTTP
    }
  },

  templateHelpers: function(){
    return this.options.tests;
  }

});

module.exports = View;
POS.attach('SettingsApp.Status.View');