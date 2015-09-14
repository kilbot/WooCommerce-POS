var FormView = require('lib/config/form-view');
var POS = require('lib/utilities/global');
var CustomerSelect = require('lib/behaviors/customer-select');

var View = FormView.extend({
  template: 'pos.tmpl-cart-customer',

  behaviors: {
    CustomerSelect: {
      behaviorClass: CustomerSelect
    }
  },

  bindings: {
    '#customer_id': 'customer_id'
  }

});

module.exports = View;
POS.attach('POSApp.Cart.Views.Customer', View);