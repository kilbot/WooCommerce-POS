var View = require('lib/config/layout-view');
var App = require('lib/config/application');
var _ = require('lodash');
var Radio = require('backbone.radio');
var Customers = require('./customer-list');
var Dropdown = require('lib/behaviors/dropdown');

var View = View.extend({
  template: 'pos.cart.customer',

  className: 'list-row',

  initialize: function(){
    this.customers = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'customers',
      perPage : 10
    });
    this.mergeOptions({
      guest: this.customers.superset().getGuestCustomer()
    }, ['guest']);
  },

  behaviors: {
    Dropdown: {
      behaviorClass: Dropdown
    }
  },

  regions: {
    customers : '.customers-list'
  },

  ui: {
    searchField     : 'input',
    removeCustomer  : '*[data-action="remove"]'
  },

  events: {
    'input @ui.searchField'   : 'query',
    'click @ui.removeCustomer': 'removeCustomer'
  },

  query: function(){
    var value = this.ui.searchField.val();
    this._query(value);
  },

  _query: _.debounce( function(value){
    this.customers
      .query(value)
      .firstPage();
  }, 149),

  modelEvents: {
    'change:customer': 'render'
  },

  dropdownContent: function(){
    this.customerSearch();
    return this.getRegion('customers').el;
  },

  //onDropdownOpen: function(){
  //
  //},

  onDropdownClose: function(){
    // reset customers list
    this.customers
      .removeTransforms()
      .setPerPage(10);
  },

  onTargetKeydown: function(e){
    this.getRegion('customers').currentView.moveFocus(e.which);
  },

  customerSearch: function(){
    var view = new Customers({
      collection: this.customers
    });

    this.listenTo(view, 'childview:customer:selected', function(view, args){
      this.saveCustomer( args.model.toJSON() );
    });

    this.getRegion('customers').show( view );
  },

  removeCustomer: function(){
    this.saveCustomer( this.getOption('guest') );
  },

  saveCustomer: function(customer){
    this.model.unset('customer', { silent: true });
    this.model.save({
      customer_id: customer.id,
      customer: customer
    });
  }

});

module.exports = View;
App.prototype.set('POSApp.Cart.Views.Customer', View);