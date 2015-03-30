var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('receipt');
var POS = require('lib/utilities/global');
var LayoutView = require('./views/layout');
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
    this.layout.status.show(view);
  },

  showItems: function(){
    var view = new ItemsView({
      order: this.order
    });

    this.layout.list.show(view);
  },

  showTotals: function(){
    var view = new TotalsView({
      model: this.order
    });

    this.layout.totals.show(view);
  },

  showActions: function(){
    var view = new Buttons({
      buttons: [{
        action: 'print',
        label: polyglot.t('buttons.print'),
        className: 'btn-primary pull-left'
      }, {
        action: 'email',
        label: polyglot.t('buttons.email'),
        className: 'btn-primary pull-left'
      }, {
        action: 'new-order',
        label: polyglot.t('buttons.new-order'),
        className: 'btn-success'
      }]
    });

    this.listenTo(view, {
      'action:print': this.print,
      'action:email': this.email,
      'action:new-order': function(){
        this.navigate('', {
          trigger: true,
          replace: true
        });
      }
    });

    this.layout.actions.show(view);
  },

  print: function(){
    Radio.request('print', 'print', {
      template: 'receipt',
      model: this.order
    });
  },

  email: function(){
    var view = new EmailView({
      email: this.order.get('customer').email
    });

    this.listenTo(view, 'action:send', function(){
      console.log('send!');
    });

    Radio.request('modal', 'open', view);
  }

});

module.exports = ReceiptRoute;
POS.attach('POSApp.Receipt.Route', ReceiptRoute);