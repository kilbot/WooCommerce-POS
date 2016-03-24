var View = require('lib/config/item-view');
var App = require('lib/config/application');
var _ = require('lodash');
var Radio = require('backbone.radio');
var Customers = require('./customer-list');
var Dropdown = require('lib/behaviors/dropdown');
var Mn = require('backbone.marionette');

var View = View.extend({
  template: 'pos.cart.customer',

  className: 'list-row',

  initialize: function(){
    this.customers = Radio.request('entities', 'get', 'customers');

    this.mergeOptions({
      guest: this.customers.getGuestCustomer()
    }, ['guest']);

    /**
     * @todo customer attr relation direct to customer model
     */
    this.listenTo(this.customers, 'modal:save', this.onModalSave);

    _.bindAll( this, 'dropdownContent' );
  },

  behaviors: {
    Dropdown: {
      behaviorClass: Dropdown
    }
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
    this.customers.setFilter(value);
  }, 149),

  modelEvents: {
    'change:customer': 'render'
  },

  dropdownContent: function( drop ){
    this.customersRegion = new Mn.Region({
      el: drop.content
    });

    // reposition on filter
    this.listenTo( this.customers, 'reset', function(){
      drop.position.call(drop);
    });

    // reposition on show
    this.listenTo( this.customersRegion, 'show', function(){
      drop.position.call(drop);
    });

    return ''; // return empty content
  },

  onDropdownOpen: function(){
    var view = new Customers({
      collection: this.customers,
      filter: this.$('input').val()
    });

    this.listenTo(view, 'childview:customer:selected', function(view){
      this.saveCustomer( view.model.toJSON() );
    });

    this.customersRegion.show(view);
  },

  onDropdownClose: function(){
    this.customersRegion.empty();
  },

  onTargetKeydown: function(e){
    this.customersRegion.currentView.moveFocus(e.which);
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