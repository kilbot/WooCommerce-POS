var Route = require('lib/config/route');
var LayoutView = require('./views/layout');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var ActionsView = require('./views/actions');
var NotesView = require('./views/notes');
var CustomerSelect = require('lib/components/customer-select/view');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');
var posChannel = bb.Radio.channel('pos');
var debug = require('debug')('cart');
var $ = require('jquery');
var _ = require('lodash');
var POS = require('lib/utilities/global');

var CartRoute = Route.extend({

  initialize: function( options ) {
    this.id = options.id;
    this.container = options.container;
    this.collection = options.collection;

    // listen for cart:add commands
    posChannel.comply( 'cart:add', this.addToCart, this );
  },

  fetch: function() {
    if (this.collection.isNew()) {
      return this.collection.fetch({ local: true });
    }
  },

  onBeforeRender: function(){
    if( this.id ) {
      this.order = this.collection.findWhere({
        local_id: this.id
      });
    } else if( this.collection.length > 0 ) {
      this.order = this.collection.at(0);
    } else {
      this.order = this.collection.add({ local_id: '' });
    }
  },

  render: function() {
    this.layout = new LayoutView();

    this.listenTo( this.layout, 'show', function() {
      this.showCart();
      this.showTotals();
      this.showCustomer();
      this.showActions();
      this.showNotes();
    });

    this.container.show( this.layout );
  },

  /**
   * Add/update tab label
   */
  updateTabLabel: _.debounce( function( order ) {
    var label = $('#tmpl-cart').data('title');
    if( order ){
      /* global accounting */
      label += ' - ' + accounting.formatMoney( order.get('total') );
    }
    posChannel.command( 'update:tab:label', label, 'right' );
  }, 100),

  /**
   *
   */
  addToCart: function( item ) {
    var attributes = item instanceof bb.Model ? item.attributes : item;
    var row;

    if( _.isUndefined( this.order.cart ) ) {
      debug('there is no cart');
    }

    if( attributes.id ) {
      row = this.order.cart.findWhere({ id: attributes.id });
    }

    if( row instanceof bb.Model ) {
      row.quantity('increase');
    } else {
      row = this.order.cart.add( attributes );
    }

    row.trigger( 'focus:row' );
  },

  /**
   *
   */
  showCart: function() {
    var view = new ItemsView({
      collection: this.order.cart
    });
    this.layout.listRegion.show( view );
  },

  /**
   *
   */
  showTotals: function() {
    var view = new TotalsView({
      model: this.order
    });
    this.on( 'discount:clicked', view.showDiscountRow );
    this.layout.totalsRegion.show( view );
  },

  /**
   *
   */
  showCustomer: function(){
    var view = new CustomerSelect();

    this.listenTo( view, 'customer:select', function( id, name ) {
      this.order.save({
        customer_id: id,
        customer_name: name
      });
    }, this);

    // bit of a hack
    // get the "Customer:" translation and add it to the view
    this.layout.customerRegion.on( 'before:show', function(view){
      var label = this.$el.html();
      view.$el.prepend( label );
    });

    this.layout.customerRegion.show( view );
  },

  /**
   * TODO: abstract as a collection of button models?
   */
  showActions: function() {

    var view = new ActionsView();

    // void cart
    this.listenTo( view, 'void:clicked', function() {
      this.order.destroy();
    });

    // add note
    this.listenTo( view, 'note:clicked', function() {
      this.trigger('note:clicked');
    });

    // cart discount
    this.listenTo( view, 'discount:clicked', function() {
      this.trigger('discount:clicked');
    });

    // add fee
    this.listenTo( view, 'fee:clicked', function(args) {
      var title = args.view.$('.action-fee').data('title');
      //posChannel.command( 'cart:add', { title: title, type: 'fee' } );
      this.addToCart({ title: title, type: 'fee' });
    });

    // add shipping
    this.listenTo( view, 'shipping:clicked', function(args) {
      var title = args.view.$('.action-shipping').data('title');
      //posChannel.command( 'cart:add', { title: title, type: 'shipping' } );
      this.addToCart({ title: title, type: 'shipping' });
    });

    // checkout
    this.listenTo( view, 'checkout:clicked', function() {
      posChannel.command('show:checkout');
    });

    this.layout.actionsRegion.show( view );
  },

  /**
   *
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