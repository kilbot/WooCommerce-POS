var ReceiptView = require('lib/config/receipt-view');
var App = require('lib/config/application');

var View = ReceiptView.extend({
  tagName: 'ul',
  template: 'pos.receipt.tmpl-totals'
});

module.exports = View;
App.prototype.set('POSApp.Receipt.Views.Totals', View);