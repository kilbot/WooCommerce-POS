var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

var View = ItemView.extend({
  template: hbs.compile( $('#tmpl-receipt').html() ),

  initialize: function(){

  }


});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Receipt', View);