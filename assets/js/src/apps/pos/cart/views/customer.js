var FormView = require('lib/config/form-view');
var App = require('lib/config/application');
var CustomerSelect = require('lib/behaviors/customer-select');

var View = FormView.extend({
  template: 'pos.cart.tmpl-customer',

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
App.prototype.set('POSApp.Cart.Views.Customer', View);