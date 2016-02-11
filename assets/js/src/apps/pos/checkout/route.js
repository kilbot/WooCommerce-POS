var Route = require('lib/config/route');
//var debug = require('debug')('checkout');
var App = require('lib/config/application');
var LayoutView = require('./layout');
var StatusView = require('./views/status');
var GatewaysView = require('./views/gateways');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');
require('./integrations');

var CheckoutRoute = Route.extend({

  initialize: function(options){
    options = options || {};
    this.container = options.container;
    this.collection = options.collection;
    this.setTabLabel( polyglot.t('titles.checkout') );
  },

  fetch: function(){
    if(this.collection.isNew()){
      return this.collection.fetch();
    }
  },

  /**
   *
   */
  render: function( id ){
    this.activeOrder = this.collection.get(id);

    if( ! this.activeOrder ){
      // return to cart
      return this.navigate('cart', { trigger: true });
    }

    if( ! this.activeOrder.isEditable() ){
      // go to receipts
      return this.navigate('receipt/' + this.activeOrder.id, { trigger: true });
    }

    this.layout = new LayoutView();
    this.listenTo( this.layout, 'show', this.onShow );
    this.container.show(this.layout);
  },

  /**
   *
   */
  onShow: function(){
    this.showStatus();
    this.showGateways();
    this.showActions();
  },

  showStatus: function(){
    var view = new StatusView({
      model: this.activeOrder
    });
    this.layout.getRegion('status').show(view);
  },

  showGateways: function(){
    this.activeOrder.gateways.order = this.activeOrder;
    var view = new GatewaysView({
      collection: this.activeOrder.gateways
    });
    this.layout.getRegion('list').show(view);
  },

  showActions: function(){
    var view = Radio.request('buttons', 'view', {
      buttons: [{
        action: 'return-to-sale',
        className: 'btn pull-left'
      },{
        action: 'process-payment',
        className: 'btn btn-success',
        icon: 'prepend'
      }]
    });

    this.listenTo(view, {
      'action:return-to-sale': function(){
        this.navigate('cart/' + this.activeOrder.id, { trigger: true });
      },
      'action:process-payment': function(btn){
        btn.trigger('state', 'loading');

        // options object
        // - may be extended by gateway
        var self = this, options = { remote: true };

        // alert third party plugins that gateway has init
        if( this.activeOrder.gateways ){
          var gateway = this.activeOrder.gateways.getActiveGateway();
          var trigger = 'order:payment:' + gateway.id;
          Radio.trigger('checkout', trigger, this.activeOrder, options );
        }

        // now save
        this.activeOrder.save({}, options)
          .done( self.onProcessPayment.bind(this) )
          .always( function(){
            btn.trigger('state', 'reset');
          });
      }
    });

    this.layout.getRegion('actions').show(view);
  },

  /**
   *
   */
  onProcessPayment: function(){

    if( this.activeOrder.get('status') !== 'failed' ){
      // order has been processed, go to receipt
      return this.navigate('receipt/' + this.activeOrder.id, { trigger: true });
    }

    // silently save, will change status to UPDATE_FAILED
    this.activeOrder.save( {}, { silent: true } );

    Radio.trigger('global', 'error', {
      title: 'Payment Error',
      message: this.activeOrder.get('payment_details.message')
    });
  }

});

module.exports = CheckoutRoute;
App.prototype.set('POSApp.Checkout.Route', CheckoutRoute);