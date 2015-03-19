var Route = require('lib/config/route');
var LayoutView = require('./views/layout');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var NotesView = require('./views/notes');
var Buttons = require('lib/components/buttons/view');
var CustomerSelect = require('lib/components/customer-select/view');
//var debug = require('debug')('cart');
var _ = require('lodash');
var POS = require('lib/utilities/global');
var polyglot = require('lib/utilities/polyglot');

var CartRoute = Route.extend({
  cartRoute: true, // used by add to cart service

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
      return this.collection.fetch();
    }
  },

  onFetch: function(id){
    this.order = this.collection.setActiveOrder(id);
  },

  render: function() {
    this.layout = new LayoutView({
      order: this.order
    });

    this.listenTo( this.layout, 'show', this.onShow );

    this.container.show( this.layout );
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
    this.layout.listRegion.show(view);
    _.invoke([
      this.layout.totalsRegion,
      this.layout.customerRegion,
      this.layout.actionsRegion,
      this.layout.notesRegion
    ], 'empty');
  },

  /**
   * Cart Items
   */
  showCart: function() {
    var view = new ItemsView({
      collection: this.order.cart
    });
    this.layout.listRegion.show(view);
  },

  /**
   * Cart Totals
   */
  showTotals: function() {
    var view = new TotalsView({
      model: this.order
    });
    this.on('discount:clicked', view.showDiscountRow);
    this.layout.totalsRegion.show(view);
  },

  /**
   * Customer Select
   */
  showCustomer: function(){
    var view = new CustomerSelect({
      model: this.order
    });

    this.listenTo(view, 'customer:select', function(customer) {
      this.order.save({
        customer_id: customer.id,
        customer: customer
      });
    });

    // bit of a hack
    // get the "Customer:" translation and add it to the view
    this.listenTo(this.layout.customerRegion, 'before:show', function(){
      var label = this.layout.customerRegion.$el.html();
      view.$el.prepend( label );
    });

    this.layout.customerRegion.show( view );
  },

  /**
   * Actions
   */
  showActions: function() {
    var view = new Buttons({
      buttons: [
        {action: 'void',      className: 'btn-danger pull-left'},
        {action: 'fee',       className: 'btn-primary'},
        {action: 'shipping',  className: 'btn-primary'},
        {action: 'discount',  className: 'btn-primary'},
        {action: 'note',      className: 'btn-primary'},
        {action: 'checkout',  className: 'btn-success'}
      ]
    });

    this.listenTo(view, {
      'action:void': function(){
        this.order.destroy();
      },
      'action:note': function(){
        this.layout.notesRegion.currentView.showNoteField();
      },
      'action:discount': function(){
        this.layout.totalsRegion.currentView.showDiscountRow();
      },
      'action:fee': function(){
        this.order.cart.addToCart({
          type  : 'fee',
          title : polyglot.t('titles.fee')
        });
      },
      'action:shipping': function(){
        this.order.cart.addToCart({
          type        : 'shipping',
          method_title: polyglot.t('titles.shipping'),
          method_id   : '' // todo: settings
        });
      },
      'action:checkout': function(){
        this.navigate('checkout/' + this.order.id, { trigger: true });
      }
    });

    this.layout.actionsRegion.show( view );
  },

  /**
   * Order Notes
   */
  showNotes: function() {
    var view = new NotesView({
      model: this.order
    });
    this.on( 'note:clicked', view.showNoteField );
    this.layout.notesRegion.show( view );
  }

});

module.exports = CartRoute;
POS.attach('POSApp.Cart.Route', CartRoute);