var View = require('lib/config/layout-view');
var App = require('lib/config/application');
//var _ = require('lodash');
var Radio = require('backbone.radio');
var Customers = require('./customer-list');

var View = View.extend({
  template: 'pos.cart.customer',

  className: 'list-row',

  initialize: function(){
    this.customers = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'customers'
    });
    var guest = this.customers.superset().getGuestCustomer();
    this.mergeOptions(guest, ['guest']);
  },

  regions: {
    customers : '.customers-list'
  },

  ui: {
    'dropDown'        : '.dropdown',
    'customerSearch'  : 'input'
  },

  events: {
    'click [data-action="remove"]': 'removeCustomer',
    'focus @ui.dropDown'    : 'setUpSearch',
    'blur @ui.dropDown'     : 'tearDownSearch'
  },

  setUpSearch: function(){
    this.ui.dropDown.addClass('open');

    var view = new Customers({
      collection: this.customers
    });
    this.getRegion('customers').show( view );
  },

  tearDownSearch: function(){
    this.ui.dropDown.removeClass('open');
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