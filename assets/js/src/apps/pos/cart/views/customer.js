var FormView = require('lib/config/form-view');
var App = require('lib/config/application');
var CustomerSelect = require('lib/behaviors/customer-select');
var _ = require('lodash');
var Radio = require('backbone.radio');

var View = FormView.extend({
  template: 'pos.cart.tmpl-customer',

  initialize: function(){
    var customers = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    this.mergeOptions(customers, ['guest']);
  },

  behaviors: {
    CustomerSelect: {
      behaviorClass: CustomerSelect
    }
  },

  bindings: {
    '#customer_id': 'customer_id'
  },

  events: {
    'select2:select [data-select="customer"]': 'selectCustomer',
    'click [data-action="remove"]': 'removeCustomer'
  },

  modelEvents: {
    'change:customer': 'render'
  },

  selectCustomer: function(e){
    var customer = _.get( e, ['params', 'data' ] );
    this.model.save({ customer: customer }, { patch: true });
  },

  removeCustomer: function(){
    this.model.unset('customer', { silent: true });
    this.model.save({
      customer_id: 0,
      customer: this.getOption('guest')
    }, { patch: true } );
  }

});

module.exports = View;
App.prototype.set('POSApp.Cart.Views.Customer', View);