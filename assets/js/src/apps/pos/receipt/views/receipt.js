var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');

var View = ItemView.extend({
  template: hbs.compile( $('#tmpl-receipt').html() ),

  initialize: function(){

  }


});

module.exports = View;
POS.attach('POSApp.Views.Receipt', View);