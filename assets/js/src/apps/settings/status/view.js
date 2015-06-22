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

  templateHelpers: function(){
    return this.options.tests;
  }

});

module.exports = View;
POS.attach('SettingsApp.Status.View');