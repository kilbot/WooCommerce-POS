var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({

  template: 'pos.cart.panel',

  regions: {
    list      : '.cart-list',
    totals    : '.cart-totals',
    customer  : '.cart-customer',
    actions   : '.cart-actions',
    note      : '.cart-notes',
    footer    : '.cart-footer'
  },

  attributes: {
    'class'   : 'panel cart'
  }

});