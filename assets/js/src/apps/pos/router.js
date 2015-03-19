var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var Products = require('./products/route');
var CartRoute = require('./cart/route');
var CheckoutRoute = require('./checkout/route');
var ReceiptRoute = require('./receipt/route');
var Radio = require('backbone.radio');
var bb = require('backbone');

var Router = Router.extend({
  routes: {
    ''            : 'showCart',
    'cart'        : 'showCart',
    'cart/:id'    : 'showCart',
    'checkout'    : 'showCheckout',
    'checkout/:id': 'showCheckout',
    'receipt/:id' : 'showReceipt'
  },

  initialize: function(options) {
    this.container = options.container;
    this.channel.comply({
      'show:cart'     : this.showCart,
      'show:checkout' : this.showCheckout,
      'show:receipt'  : this.showReceipt
    }, this);
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
    this.initOrders();
  },

  initOrders: function(){
    if(this.orders){ return; }

    // attach orders
    this.orders = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'orders'
    });

    // listen for add/remove events
    this.listenTo(this.orders, 'add remove', function(){
      if( !this.orders.isNew() && this._currentRoute.cartRoute ){
        this.execute( this.showCart );
      }
    });
  },

  onBeforeRoute: function(){
    this.setActiveTab();
    this.showProducts();
    Radio.command('header', 'update:title', '');
  },

  setActiveTab: function(){
    var tab = bb.history.getFragment() === '' ? 'left' : 'right';
    this.container.tabs.setActive(tab);
  },

  showProducts: function(){
    if( this.layout.leftRegion.hasView() ){
      return;
    }
    var products = new Products({
      container : this.layout.leftRegion
    });
    products.enter();
  },

  showCart: function() {
    return new CartRoute({
      container : this.layout.rightRegion,
      collection: this.orders
    });
  },

  showCheckout: function() {
    return new CheckoutRoute({
      container : this.layout.rightRegion,
      collection: this.orders
    });
  },

  showReceipt: function() {
    return new ReceiptRoute({
      container : this.layout.rightRegion,
      collection: this.orders
    });
  }

});

module.exports = Router;
POS.attach('POSApp.Router', Router);