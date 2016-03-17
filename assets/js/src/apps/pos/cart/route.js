var Route = require('lib/config/route');
var LayoutView = require('./layout');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var NotesView = require('./views/notes');
var CustomerView = require('./views/customer');
var Buttons = require('lib/components/buttons/view');
//var debug = require('debug')('cart');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var CartRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container  = options.container;
    this.collection = options.collection;
    this.setTabLabel( polyglot.t('titles.cart') );

    this.listenTo( this.collection, {
      destroy: function(){
        this.render();
      }
    });
  },

  /**
   *
   */
  addToCart: function( products ){
    if( this.activeOrder ){

      // if new, wait for save to complete, then:
      // - update the url
      // - re-render
      if( this.activeOrder.id === 'new' ) {
        this.listenToOnce(this.activeOrder, {
          'sync': function ( model ) {
            this.navigate( 'cart/' + model.id );
            this.render( model.id );
          }
        });
      }

      this.activeOrder.cart.add( products );
    }
  },

  /**
   * Fetch orders from idb if new
   */
  fetch: function() {
    //if (this.collection.isNew()) {
    //  return this.collection.fetch();
    //}
  },

  /**
   *
   */
  render: function(id) {
    this.setActiveOrder( id );
    this.updateTabLabel();
    this.layout = new LayoutView();
    this.listenTo( this.layout, 'show', this.onShow );
    this.container.show( this.layout );
  },

  /**
   *
   */
  setActiveOrder: function(id){
    if( ! this.collection.get('new') ){
      this.collection.add({ local_id: 'new' });
    }

    this.activeOrder = this.collection.get(id);

    if( ! this.activeOrder ){
      this.activeOrder = this.collection.first();
    }

    if( ! this.activeOrder.isEditable() ){
      this.navigate('receipt/' + this.activeOrder.id, { trigger: true });
    }
  },

  /**
   *
   */
  updateTabLabel: function(){
    this.setTabLabel( this.activeOrder.getLabel() );
    this.listenTo( this.activeOrder, 'change:total', function(model){
      this.setTabLabel( model.getLabel() );
    });
  },

  /**
   *
   */
  onShow: function(){
    if( this.activeOrder && this.activeOrder.cart ){
      this.showCart();
      this._showCart();
    }
  },

  /**
   *
   */
  _showCart: function(){
    if( this.activeOrder.cart.length > 0 ){
      this.showTotals();
      this.showCustomer();
      this.showActions();
      this.showNotes();
    }
  },

  /**
   * Cart Items
   */
  showCart: function() {
    var view = new ItemsView({
      collection: this.activeOrder.cart
    });
    this.layout.getRegion('list').show(view);
  },

  /**
   * Cart Totals
   */
  showTotals: function() {
    var view = new TotalsView({
      model: this.activeOrder
    });
    this.layout.getRegion('totals').show(view);
  },

  /**
   *
   */
  showCustomer: function(){
    var view = new CustomerView({
      model: this.activeOrder
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
        {action: 'fee',       className: 'btn-primary'},
        {action: 'shipping',  className: 'btn-primary'},
        //{action: 'discount',  className: 'btn-primary'},
        {action: 'note',      className: 'btn-primary'},
        {action: 'checkout',  className: 'btn-success'}
      ]
    });

    this.listenTo(view, {
      'action:void': function(){
        var order = this.activeOrder;
        view.triggerMethod('disableButtons');
        this.layout.getRegion('list').currentView.fadeCart().done(function(){
          order.destroy();
        });
      },
      'action:note': function(){
        this.layout.getRegion('note').currentView.showNoteField();
      },
      //'action:discount': function(){
      //  this.layout.getRegion('totals').currentView.showDiscountRow();
      //},
      'action:fee': function(){
        this.activeOrder.cart.add( {}, { type: 'fee' } );
      },
      'action:shipping': function(){
        this.activeOrder.cart.add( {}, { type: 'shipping' });
      },
      'action:checkout': function(){
        this.navigate('checkout/' + this.activeOrder.id, { trigger: true });
      }
    });

    this.layout.getRegion('actions').show( view );
  },

  /**
   * Order Notes
   */
  showNotes: function() {
    var view = new NotesView({
      model: this.activeOrder
    });
    this.on( 'note:clicked', view.showNoteField );
    this.layout.getRegion('note').show( view );
  }

});

module.exports = CartRoute;
App.prototype.set('POSApp.Cart.Route', CartRoute);