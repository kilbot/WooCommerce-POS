var Route = require('lib/config/route');
var Radio = require('backbone.radio');
//var debug = require('debug')('receipt');
var POS = require('lib/utilities/global');
var LayoutView = require('./views/layout');

var CheckoutRoute = Route.extend({

  initialize: function( options ) {
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

  fetch: function() {

  },
  //
  //onFetch: function(id){
  //  if(id){
  //    this.order = this.collection.get(id);
  //  } else if(this.collection.length > 0){
  //    this.order = this.collection.at(0);
  //  }
  //
  //  if(!this.order){
  //    this.order = this.collection.add({});
  //  }
  //
  //  this.collection.active = this.order;
  //},

  render: function() {
    this.layout = new LayoutView({
      order: this.collection.active
    });

    this.listenTo( this.layout, 'show', function() {

    });

    this.container.show( this.layout );
  }

});

module.exports = CheckoutRoute;
POS.attach('POSApp.Checkout.Route', CheckoutRoute);