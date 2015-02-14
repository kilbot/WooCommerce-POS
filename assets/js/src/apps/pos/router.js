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
  columns: 2,

  initialize: function(options) {
    this.container = options.container;
    this.channel.comply('show:cart', this.showCart, this);
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);

    if(bb.history.getFragment() === ''){
      Radio.command('header', 'update:tab', {id:'left', active: true});
    } else {
      Radio.command('header', 'update:tab', {id:'right', active: true});
    }

    Radio.command('header', 'update:title', '');
  },

  routes: {
    ''            : 'showCart',
    'cart'        : 'showCart',
    'cart/:id'    : 'showCart',
    'checkout'    : 'showCheckout',
    'checkout/:id': 'showCheckout',
    'receipt/:id' : 'showReceipt'
  },

  onBeforeRoute: function(){
    if(!this.layout.leftRegion.hasView()){
      this.showProducts();
    }
  },

  showProducts: function(){
    var products = new Products({
      container : this.layout.leftRegion
    });
    products.enter();
  },

  showCart: function() {
    return new CartRoute({
      container : this.layout.rightRegion
    });
  },

  showCheckout: function() {
    return new CheckoutRoute({
      container : this.layout.rightRegion
    });
  },

  showReceipt: function() {
    return new ReceiptRoute({
      container : this.layout.rightRegion
    });
  }

});

module.exports = Router;
POS.attach('POSApp.Router', Router);