var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('checkout');
var POS = require('lib/utilities/global');
var LayoutView = require('./views/layout');
var StatusView = require('./views/status');
var GatewaysView = require('./views/gateways');
var ActionsView = require('./views/actions');

var CheckoutRoute = Route.extend({

  initialize: function(options){
    options = options || {};
    this.container = options.container;
    this.collection = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'orders'
    });

    // checkout label
    this.label = options.label;
    Radio.command('header', 'update:tab', {id: 'right', label: this.label});
  },

  fetch: function(){
    //if (this.collection.isNew()) {
    this.collection.reset();
    return this.collection.fetch({ local: true });
    //}
  },

  onFetch: function(id){
    if(id){
      this.order = this.collection.get(id);
    } else if(this.collection.length > 0){
      this.order = this.collection.at(0);
    }

    this.collection.active = this.order;
  },

  render: function(){
    this.layout = new LayoutView();

    this.listenTo( this.layout, 'show', function(){
      this.showStatus();
      this.showGateways();
      this.showActions();
    });

    this.container.show(this.layout);
  },

  showStatus: function(){
    var view = new StatusView({
      model: this.order
    });
    this.layout.headerRegion.show(view);
  },

  showGateways: function(){
    var view = new GatewaysView({
      collection: this.order.gateways
    });
    this.layout.listRegion.show(view);
  },

  showActions: function(){
    var view = new ActionsView();

    this.listenTo(view, {
      'close': function(){
        this.navigate('cart/' + this.order.id, {
          trigger: true,
          replace: true
        });
      },
      'process': function(){
        this.order.process();
      }
    });

    this.layout.actionsRegion.show(view);
  }

});

module.exports = CheckoutRoute;
POS.attach('POSApp.Checkout.Route', CheckoutRoute);