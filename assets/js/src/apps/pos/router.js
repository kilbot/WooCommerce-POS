var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var Products = require('./products/route');
var CartRoute = require('./cart/route');
var entitiesChannel = Backbone.Radio.channel('entities');

var Router = Router.extend({
  columns: 2,

  initialize: function(options) {
    this.container = options.container;
    this.orders = entitiesChannel.request('get', {
      new   : true,
      type  : 'collection',
      name  : 'orders'
    });
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
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
      container  : this.layout.leftRegion
    });
    products.enter();
  },

  showCart: function(id) {
    return new CartRoute({
      container  : this.layout.rightRegion,
      collection : this.orders,
      id: id
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