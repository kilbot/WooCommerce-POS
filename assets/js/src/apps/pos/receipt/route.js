var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('receipt');
var POS = require('lib/utilities/global');
var LayoutView = require('./layout');
var StatusView = require('./views/status');
var ItemsView = require('./views/items');
var TotalsView = require('./views/totals');
var EmailView = require('./views/modals/email');
var polyglot = require('lib/utilities/polyglot');
var Buttons = require('lib/components/buttons/view');
var $ = require('jquery');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.collection = options.collection;
    this.setTabLabel({
      tab   : 'right',
      label : polyglot.t('titles.receipt')
    });
  },

  fetch: function() {
    if(this.collection.isNew()){
      return this.collection.fetch();
    }
  },

  onFetch: function(id){
    this.order = this.collection.get(id);
  },

  render: function() {
    this.layout = new LayoutView({
      model: this.order
    });

    this.listenTo( this.layout, 'show', function() {
      this.showStatus();
      this.showItems();
      this.showTotals();
      this.showActions();
    });

    this.container.show( this.layout );
  },

  showStatus: function(){
    var view = new StatusView({
      model: this.order
    });
    this.layout.getRegion('status').show(view);
  },

  showItems: function(){
    var view = new ItemsView({
      model: this.order
    });

    this.layout.getRegion('list').show(view);
  },

  showTotals: function(){
    var view = new TotalsView({
      model: this.order
    });

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
    Radio.request('print', 'print', {
      template: 'receipt',
      model: this.order
    });
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
        var email = args.view.getRegion('content').currentView.ui.email.val();
        self.listenTo(buttons, 'action:send', function(btn, view){
          self.send(btn, view, email);
        });
      });

  },

  // todo: refactor
  send: function(btn, view, email){
    var order_id = this.order.id,
        ajaxurl = Radio.request('entities', 'get', {
          type: 'option',
          name: 'ajaxurl'
        });

    btn.trigger('state', 'loading');
    view.triggerMethod('message', 'reset');

    function onSuccess(model, resp){
      btn.trigger('state', 'success');
      if(resp.success){
        view.triggerMethod('message', resp.success, 'success');
      } else {
        view.triggerMethod('message', 'success');
      }
    }

    function onError(jqxhr){
      btn.trigger('state', 'error');
      if(jqxhr.responseJSON && jqxhr.responseJSON.errors){
        view.triggerMethod(
          'message', jqxhr.responseJSON.errors[0].message, 'error'
        );
      } else {
        view.triggerMethod('message', 'error');
      }
    }

    $.getJSON( ajaxurl, {
      action: 'wc_pos_email_receipt',
      order_id: order_id,
      email : email
    })
    .done(onSuccess)
    .fail(onError);
  }

});

module.exports = ReceiptRoute;
POS.attach('POSApp.Receipt.Route', ReceiptRoute);