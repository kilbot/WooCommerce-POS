var App = require('lib/config/application');
var Router = require('lib/config/router');
var Products = require('./products/route');
var CartRoute = require('./cart/route');
var CheckoutRoute = require('./checkout/route');
var ReceiptRoute = require('./receipt/route');
var Radio = require('backbone.radio');
var bb = require('backbone');
var _ = require('lodash');

var POSRouter = Router.extend({

  columns: ['left', 'right'],

  routes: {
    '(cart)(/:id)(/)'  : 'showCart',
    'checkout(/:id)(/)': 'showCheckout',
    'receipt(/:id)(/)' : 'showReceipt'
  },

  initialize: function(options) {
    this.container = options.container;
    this.channel.reply({
      'show:cart'     : this.showCart,
      'show:checkout' : this.showCheckout,
      'show:receipt'  : this.showReceipt,
      'add:to:cart'   : this.addToCart
    }, this);

    this.initOrders();
  },

  onBeforeEnter: function() {
    this.container.show(this.layout);
  },

  /**
   * init a filtered collection of open orders
   */
  initOrders: function(){
    if(this.openOrders){
      return;
    }

    // attach orders
    this.openOrders = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'orders',
      perPage : 10 // max open carts
    });

    // show only open orders
    this.openOrders.filterBy('openOrders', function(model) {
      return model.isEditable();
    });

    // listen to order collection
    //this.listenTo(this.openOrders, {
    //  add     : this.addOrder,
    //  destroy : this.removeOrder
    //});
  },

  onBeforeRoute: function(){
    this.setActiveTab();
    this.showProducts();
    Radio.request('header', 'update:title', '');
  },

  /**
   * todo: refactor
   * hacky way to set the right tab
   */
  setActiveTab: function(){
    if( bb.history.getFragment() ){
      var rightTab, tabViews = _.get(this, ['container', 'tabs', 'children']);
      if( tabViews ){
        rightTab = tabViews.findByIndex(1);
      }
      if( rightTab ){
        rightTab.$el.click();
      }
    }
  },

  showProducts: function(){
    if( this.layout.getRegion('left').hasView() ){
      return;
    }

    var products = new Products({
      container : this.layout.getRegion('left'),
      column    : this.columns[0]
    });

    products.enter();
  },

  showCart: function() {
    return new CartRoute({
      container : this.layout.getRegion('right'),
      filtered  : this.openOrders,
      column    : this.columns[1]
    });
  },

  showCheckout: function() {
    return new CheckoutRoute({
      container : this.layout.getRegion('right'),
      collection: this.openOrders.superset(),
      column    : this.columns[1]
    });
  },

  showReceipt: function() {
    var autoPrint = Radio.request('entities', 'get', {
      type: 'option',
      name: 'auto_print'
    });

    return new ReceiptRoute({
      container : this.layout.getRegion('right'),
      collection: this.openOrders.superset(),
      autoPrint : autoPrint,
      column    : this.columns[1]
    });
  },

  /**
   * Add to cart only when cart route is active
   */
  addToCart: function(products){
    if(this._currentRoute instanceof CartRoute){
      this._currentRoute.addToCart(products);
    }
  },

  addOrder: function(order){
    if(this._currentRoute instanceof CartRoute){
      //bb.history.navigate('cart/' + order.id);
      this.execute(this.showCart, [order.id]);
    }
  },

  removeOrder: function(){
    if(this._currentRoute instanceof CartRoute){
      bb.history.navigate('');
      this.execute(this.showCart);
    }
  }

});

module.exports = POSRouter;
App.prototype.set('POSApp.Router', POSRouter);