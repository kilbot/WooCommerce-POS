var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

var View = ItemView.extend({

  initialize: function(){
    this.template = hbs.compile( $('#tmpl-checkout-actions').html() );
  },

  ui: {
    close: 'a[data-action="close"]',
    process: 'a[data-action="process"]'
  },

  triggers: {
    'click @ui.close': 'close',
    'click @ui.process': 'process'
  }

});

module.exports = View;
POS.attach('POSApp.Checkout.Views.Actions', View);