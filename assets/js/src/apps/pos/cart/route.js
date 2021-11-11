var Route = require('lib/config/route');
var LayoutView = require('./layout');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var NotesView = require('./views/notes');
var CustomerView = require('./views/customer');
var Buttons = require('lib/components/buttons/view');
//var debug = require('debug')('cart');
var _ = require('lodash');
var App = require('lib/config/application');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');

var CartRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container  = options.container;
    this.collection = options.collection;
    this.setTabLabel({
      tab   : 'right',
      label : polyglot.t('titles.cart')
    });
  },

  fetch: function() {
    if (this.collection.isNew()) {
      return this.collection.fetch({ silent: true });
    }
  },

  onFetch: function(id){
    this.order = this.collection.setActiveOrder(id);

    if(this.order){
      this.setTabLabel({
        tab   : 'right',
        label : this.tabLabel(this.order)
      });

      this.listenTo( this.order, 'change:total', function(model){
        this.setTabLabel({
          tab   : 'right',
          label : this.tabLabel(model)
        });
      });
    }
  },

  render: function() {
    this.layout = new LayoutView({
      order: this.order
    });

    this.listenTo( this.layout, 'show', this.onShow );

    this.container.show( this.layout );
  },

  onRender: function(){
    if( this.order && !this.order.isEditable() ){
      this.navigate('receipt/' + this.order.id, { trigger: true });
    }
  },

  onShow: function(){
    if(!this.order){
      return this.noActiveOrder();
    }

    this.showCart();
    this.showTotals();
    this.showCustomer();
    this.showActions();
    this.showNotes();
  },

  /**
   * Empty Cart
   */
  noActiveOrder: function(){
    var view = new ItemsView();
    this.layout.getRegion('list').show(view);
    _.invoke([
      this.layout.getRegion('totals'),
      this.layout.getRegion('customer'),
      this.layout.getRegion('actions'),
      this.layout.getRegion('note')
    ], 'empty');
  },

  /**
   * Cart Items
   */
  showCart: function() {
    var view = new ItemsView({
      collection: this.order.cart
    });
    this.layout.getRegion('list').show(view);
  },

  /**
   * Cart Totals
   */
  showTotals: function() {
    var view = new TotalsView({
      model: this.order
    });
    this.on('discount:clicked', view.showDiscountRow);
    this.layout.getRegion('totals').show(view);
  },

  showCustomer: function(){
    var view = new CustomerView({
      model: this.order
    });
    this.layout.getRegion('customer').show( view );
  },

  /**
   * Actions
   * - order discount removed in WC 2.3
   */
  showActions: function() {
    var view = new Buttons({
      buttons: [
        {action: 'void',      className: 'btn-danger pull-left'},
        {action: 'billing',   className: 'btn-primary'},
        {action: 'fee',       className: 'btn-primary'},
        {action: 'shipping',  className: 'btn-primary'},
        //{action: 'discount',  className: 'btn-primary'},
        {action: 'note',      className: 'btn-primary'},
        {action: 'checkout',  className: 'btn-success'}
      ]
    });

    this.listenTo(view, {
      'action:void': function(btn, view){
        view.triggerMethod('disableButtons');
        this.layout.getRegion('list').currentView.voidCart( this.order );
      },
      'action:note': function(){
        this.layout.getRegion('note').currentView.showNoteField();
      },
      //'action:discount': function(){
      //  this.layout.getRegion('totals').currentView.showDiscountRow();
      //},
      'action:fee': function(){
        this.order.cart.addToCart({
          type  : 'fee',
          name  : polyglot.t('titles.fee')
        });
      },
      'action:shipping': function(){
        var shipping = Radio.request('entities', 'get', {
          type: 'option',
          name: 'shipping'
        });
        var method_ids = _.keys(shipping);
        this.order.cart.addToCart({
          type        : 'shipping',
          method_title: polyglot.t('titles.shipping'),
          method_id   : _.first(method_ids) || ''
        });
      },
      'action:billing': function () {
        if (!this.order.cart.findWhere({type: 'billing'})) {
          this.order.cart.addToCart({
            type: 'billing',
            method_title: polyglot.t('titles.billing')
          });
        }
      },
      'action:checkout': function () {
        var billing = this.order.cart.findWhere({type: 'billing'});
        if (!billing.attributes['$valid']) {
          Radio.trigger('global', 'error', {
            status: polyglot.t('titles.billing_error'),
            message: polyglot.t('messages.billing_mandatory')
          });
          return;
        }
        this.navigate('checkout/' + this.order.id, { trigger: true });
      }
    });

    this.layout.getRegion('actions').show( view );
  },

  /**
   * Order Notes
   */
  showNotes: function() {
    var view = new NotesView({
      model: this.order
    });
    this.on( 'note:clicked', view.showNoteField );
    this.layout.getRegion('note').show( view );
  },

  tabLabel: function(order){
    var prefix = polyglot.t('titles.cart'),
      total = order.get('total'),
      formatTotal = Utils.formatMoney(total);

    return prefix + ': ' + formatTotal;
  }

});

module.exports = CartRoute;
App.prototype.set('POSApp.Cart.Route', CartRoute);
