var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('receipt');
var POS = require('lib/utilities/global');
var LayoutView = require('./views/layout');
var ReceiptView = require('./views/receipt');
var polyglot = require('lib/utilities/polyglot');
var Buttons = require('lib/components/buttons/view');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.collection = options.collection;

    // checkout label
    Radio.command('header', 'update:tab', {
      id: 'right',
      label: polyglot.t('title.receipt')
    });
  },

  fetch: function() {
    if(this.collection.isNew()){
      return this.collection.fetch();
    }
  },

  onFetch: function(id){
    this.order = this.collection.findWhere({id: id});
    if(!this.order){
      console.log('no receipt found!');
    }
  },

  render: function() {
    this.layout = new LayoutView();

    this.listenTo( this.layout, 'show', function() {
      this.showStatus();
      this.showReceipt();
      this.showActions();
    });

    this.container.show( this.layout );
  },

  showStatus: function(){

  },

  showReceipt: function(){
    var view = new ReceiptView({
      model: this.model
    });

    this.layout.listRegion.show(view);
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
      'action:email': function(){

      },
      'action:new-order': function(){
        this.navigate('', {
          trigger: true,
          replace: true
        });
      }
    });

    this.layout.actionsRegion.show(view);
  },

  print: function(){
    Radio.request('print', 'print', {
      template: 'receipt',
      model: this.model
    });
  }

});

module.exports = ReceiptRoute;
POS.attach('POSApp.Receipt.Route', ReceiptRoute);