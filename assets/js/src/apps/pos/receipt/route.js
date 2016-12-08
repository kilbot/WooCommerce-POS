var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('receipt');
var App = require('lib/config/application');
var LayoutView = require('./layout');
var StatusView = require('./views/status');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var EmailView = require('./views/modals/email');
var polyglot = require('lib/utilities/polyglot');
var Buttons = require('lib/components/buttons/view');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.collection = options.collection;
    this.autoPrint = options.autoPrint;
    this.setTabLabel( polyglot.t('titles.receipt') );
    this.tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    }) || {};
  },

  fetch: function(id) {
    id = parseInt(id);

    this.order = this.collection.get(id);

    if(!this.order){
      var self = this;
      var order = this.collection.add({ local_id: id });
      return order.fetch({ remote: false })
        .then(function(response){
          if(response){
            self.order = order;
          } else {
            order.destroy();
          }
        });
    }
  },

  render: function() {

    if(!this.order){
      return this.navigate('cart', { trigger: true });
    }

    this.layout = new LayoutView({
      model: this.order
    });

    this.listenTo( this.layout, 'show', function() {
      this.showStatus();
      this.showItems();
      this.showTotals();
      this.showActions();
      if(this.autoPrint){
        this.print();
      }
    });

    this.container.show( this.layout );
  },

  showStatus: function(){
    var view = new StatusView({ model: this.order });
    this.listenTo(view, 'open:modal', this.openExternalGateway);
    this.layout.getRegion('status').show(view);
  },

  showItems: function(){
    var view = new ItemsView({ model: this.order });
    this.layout.getRegion('list').show(view);
  },

  showTotals: function(){
    var view = new TotalsView({ model: this.order });
    this.layout.getRegion('totals').show(view);
  },

  showActions: function(){
    var view = new Buttons({
      buttons: [{
        action: 'print',
        className: 'btn-primary pull-left',
        icon: 'append'
      }, {
        action: 'email',
        className: 'btn-primary pull-left'
      }, {
        action: 'new-order',
        className: 'btn-success'
      }]
    });

    this.listenTo(view, {
      'action:print': this.print,
      'action:email': this.email,
      'action:new-order': function(){
        this.navigate('', { trigger: true });
      }
    });

    this.layout.getRegion('actions').show(view);
  },

  print: function(btn){
    btn.trigger('state', [ 'loading', '' ]);
    Radio.request('print', 'receipt', {
      model: this.order
    })
    .then(function(){
      btn.trigger('state', [ 'success', null ]);
    })
    .catch(function(error){
      Radio.request('modal', 'error', error);
      btn.trigger('state', [ 'error', null ]);
    });
  },

  email: function(){
    var self = this;

    var view = new EmailView({
      order_id: this.order.get('id'),
      email: this.order.get('customer.email')
    });

    var modal = Radio.request('modal', 'open', view);

    var btnView = modal.getRegion('footerRegion').currentView;

    this.listenTo(btnView, {
      'action:send': function(btn){
        var model = modal.getRegion('bodyRegion').currentView.model;
        self.send(btn, model);
      },
      'action:send-close': function(btn){
        var model = modal.getRegion('bodyRegion').currentView.model;
        self.send(btn, model)
          .then(function(){
            Radio.request('modal', 'close', modal.$el.data().vex.id);
          });
      }
    });
  },

  send: function(btn, model){
    btn.trigger('state', [ 'loading', '' ]);

    return this.order.emailReceipt( model )
      .then(function(){
        btn.trigger('state', [ 'success', '' ]);
      })
      .catch(function(error){
        btn.trigger('state', ['error', error]);
      });
  }

});

module.exports = ReceiptRoute;
App.prototype.set('POSApp.Receipt.Route', ReceiptRoute);