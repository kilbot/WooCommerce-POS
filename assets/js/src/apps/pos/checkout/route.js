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

  onRender: function(){
    if( this.order && !this.order.isEditable() ){
      this.navigate('receipt/' + this.order.id, { trigger: true });
    }
  },

  showStatus: function(){
    var view = new StatusView({
      model: this.order
    });
    this.layout.getRegion('status').show(view);
  },

  showGateways: function(){
    this.order.gateways.order = this.order;
    var view = new GatewaysView({
      collection: this.order.gateways
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
        this.navigate('cart/' + this.order.id, { trigger: true });
      },
      'action:process-payment': function(btn){
        btn.trigger('state', 'loading');

        var billing = this.order.cart.findWhere({ type: 'billing'});
        if ( billing ) {
            for ( var key in billing.attributes) {
              if (key.indexOf('billing_') !== -1 &&
                billing.attributes[key] !== '') {
                if (!this.order.attributes.billing) {
                  this.order.attributes.billing={};
                }

                this.order.attributes.billing[key.substring(8)]=
                  billing.attributes[key];
              }
            }
        }


        this.order.process()
          .always(function(){
            btn.trigger('state', 'reset');
          });
      }
    });

    this.layout.getRegion('actions').show(view);
  }

});

module.exports = CheckoutRoute;
App.prototype.set('POSApp.Checkout.Route', CheckoutRoute);
