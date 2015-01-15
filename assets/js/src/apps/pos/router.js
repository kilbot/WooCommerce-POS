var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var Products = require('./products/route');
var CartRoute = require('./cart/route');
var entitiesChannel = Backbone.Radio.channel('entities');
var FilteredCollection = require('lib/config/filtered-collection');

var Router = Router.extend({
  initialize: function(options) {
    this.container = options.container;

    this.products = {}
    this.products.collection = entitiesChannel.request('products');
    this.products.filtered   = new FilteredCollection( this.products.collection );

    this.cart = entitiesChannel.request('cart');
    this.orders = entitiesChannel.request('orders');

    this.channel.reply({
      'get:products': function(){
        return this.products.filtered;
      },
      'get:cart': function(){
        return this.cart;
      },
      'get:orders': function(){
        return this.orders;
      }
    }, this);
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
    this.container.$el.addClass('two-column');
  },

  routes: {
    '' : 'showCart',
    'cart' : 'showCart',
    'cart/:id' : 'showCart',
    'checkout' : 'showCheckout',
    'checkout/:id' : 'showCheckout',
    'receipt/:id' : 'showReceipt'
  },

  onBeforeRoute: function(){
    if( ! this.layout.leftRegion.hasView() ){
      this.showProducts();
    }
  },

  showProducts: function(){
    var products = new Products({
      container  : this.layout.leftRegion,
      collection : this.products.collection,
      filtered   : this.products.filtered
    });
    products.enter();
  },

  showCart: function(id) {
    return new CartRoute({
      container  : this.layout.rightRegion
    });

    //new POSApp.Cart.Controller({ id: id, region: this.init() });
  },

  showCheckout: function(id) {
    //new POSApp.Checkout.Controller({ id: id, region: this.init() });
  },

  showReceipt: function(id) {
    //new POSApp.Receipt.Controller({ id: id, region: this.init() });
  }

});

module.exports = Router;
POS.attach('POSApp.Router', Router);