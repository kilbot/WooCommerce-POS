var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

var View = ItemView.extend({
  tagName: 'h4',
  initialize: function(){
    this.template = hbs.compile( $('#tmpl-checkout-status').html() );
  }

});

module.exports = View;
POS.attach('POSApp.Checkout.Views.Status', View);