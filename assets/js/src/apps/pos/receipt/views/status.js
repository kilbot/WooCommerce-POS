var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
//var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

var View = ItemView.extend({
  tagName: 'h4',
  
  className: function(){
    return this.model.get('status');
  },

  initialize: function(){
    var status = this.model.get('payment_details.paid') ? 'paid' : 'unpaid';
    this.template = hbs.compile(
      polyglot.t('titles.' + status) + ': {{{money total}}}'
    );
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Status', View);