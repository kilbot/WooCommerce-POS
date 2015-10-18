var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  template: 'pos.receipt.list',

  regions: {
    status  : '.receipt-status',
    list    : '.receipt-list',
    totals  : '.receipt-totals',
    actions : '.receipt-actions'
  },

  className: function(){
    return 'panel receipt ' + this.model.get('status');
  }

});