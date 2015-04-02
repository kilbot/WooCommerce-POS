var Route = require('lib/config/route');
//var debug = require('debug')('checkout');
var POS = require('lib/utilities/global');
var LayoutView = require('./layout');
var StatusView = require('./views/status');
var GatewaysView = require('./views/gateways');
var Buttons = require('lib/components/buttons/view');
var polyglot = require('lib/utilities/polyglot');

var CheckoutRoute = Route.extend({

  initialize: function(options){
    options = options || {};
    this.container = options.container;
    this.collection = options.collection;
    this.setTabLabel({
      tab   : 'right',
      label : polyglot.t('titles.checkout')
    });
  },

  fetch: function(){
    if(this.collection.isNew()){
      return this.collection.fetch();
    }
  },

  onFetch: function(id){
    this.order = this.collection.setActiveOrder(id);

    if(this.order){
      this.listenTo( this.order, 'change:status', function(model){
        if(!model._open && model.get('status') !== 'failed'){
          this.navigate('receipt/' + model.id, { trigger: true });
        }
      });
    }
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

  onRender: function(){
    if( this.order && !this.order._open ){
      this.navigate('receipt/' + this.order.id, { trigger: true });
    }
  },

  showStatus: function(){
    var view = new StatusView({
      model: this.order
    });
    this.layout.getRegion('header').show(view);
  },

  showGateways: function(){
    this.order.gateways.order_total = this.order.get('total');
    var view = new GatewaysView({
      collection: this.order.gateways
    });
    this.layout.getRegion('list').show(view);
  },

  showActions: function(){
    var view = new Buttons({
      buttons: [{
        action: 'return-to-sale',
        className: 'btn pull-left'
      },{
        action: 'process-payment',
        className: 'btn btn-success'
      }]
    });

    this.listenTo(view, {
      'action:return-to-sale': function(){
        this.navigate('cart/' + this.order.id, {
          trigger: true,
          replace: true
        });
      },
      'action:process-payment': function(){
        this.order.process();
      }
    });

    this.layout.getRegion('actions').show(view);
  }

});

module.exports = CheckoutRoute;
POS.attach('POSApp.Checkout.Route', CheckoutRoute);