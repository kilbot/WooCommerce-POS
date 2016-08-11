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
        className: 'btn-primary pull-left'
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

  print: function(){
    var view = Radio.request('print', 'receipt', {
      order: this.order
    });
    view.print();
  },

  email: function(){
    var self = this;

    var view = new EmailView({
      order_id: this.order.get('id'),
      email: this.order.get('customer.email')
    });

    Radio.request('modal', 'open', view)
      .then(function(args){
        var buttons = args.view.getButtons();
        self.listenTo(buttons, 'action:send', function(btn, view){
          var email = args.view.getRegion('content').currentView.getEmail();
          self.send(btn, view, email);
        });
      });

  },

  // todo: refactor
  send: function(btn, view, email){
    var order_id = this.order.get('id'),
        ajaxurl = Radio.request('entities', 'get', {
          type: 'option',
          name: 'ajaxurl'
        });

    btn.trigger('state', [ 'loading', '' ]);

    function onSuccess(resp){
      if(resp.result === 'success'){
        btn.trigger('state', [ 'success', resp.message ]);
      } else {
        btn.trigger('state', [ 'error', resp.message ]);
      }
    }

    function onError(jqxhr){
      var message = null;
      if(jqxhr.responseJSON && jqxhr.responseJSON.errors){
        message = jqxhr.responseJSON.errors[0].message;
      }
      btn.trigger('state', ['error', message]);
    }

    App.prototype.getJSON( ajaxurl, {
      action: 'wc_pos_email_receipt',
      order_id: order_id,
      email : email
    })
    .done(onSuccess)
    .fail(onError);
  }

});

module.exports = ReceiptRoute;
App.prototype.set('POSApp.Receipt.Route', ReceiptRoute);