var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var hbs = require('handlebars');

module.exports = ItemView.extend({
  initialize: function(){
    this.template = hbs.compile( $('#tmpl-cart-actions').html() );
  },
  triggers: {
    'click .action-void'  : 'void:clicked',
    'click .action-note'  : 'note:clicked',
    'click .action-discount': 'discount:clicked',
    'click .action-fee'     : 'fee:clicked',
    'click .action-shipping': 'shipping:clicked',
    'click .action-checkout': 'checkout:clicked'
  }

});