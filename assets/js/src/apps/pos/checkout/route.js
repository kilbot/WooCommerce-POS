var Route = require('lib/config/route');
//var debug = require('debug')('checkout');
var App = require('lib/config/application');
var LayoutView = require('./layout');
var StatusView = require('./views/status');
var GatewaysView = require('./views/gateways');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');

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

  onFetch: function(id){
    this.activeOrder = this.collection.get(id);

    if( this.activeOrder && ! this.activeOrder.isEditable() ){
      this.navigate('receipt/' + this.activeOrder.id, { trigger: true });
    }

    if(this.activeOrder){
      this.listenTo( this.activeOrder, 'change:status', function(model){
        if(!model.isEditable() && model.get('status') !== 'failed'){
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

        // alert third party plugins that gateway has init
        if( this.activeOrder.gateways ){
          var gateway = this.activeOrder.gateways.getActiveGateway();
          var trigger = 'order:payment:' + gateway.id;
          Radio.trigger('checkout', trigger, this.activeOrder );
        }

        var always = function(){
          btn.trigger('state', 'reset');
        };

        this.activeOrder.save({}, {
          remote: true,
          success: always,
          error: always
        });
      }
    });

    this.layout.getRegion('actions').show(view);
  }

});

module.exports = CheckoutRoute;
App.prototype.set('POSApp.Checkout.Route', CheckoutRoute);