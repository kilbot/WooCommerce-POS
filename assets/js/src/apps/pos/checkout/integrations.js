var Service = require('lib/config/service');
var App = require('lib/config/application');
var debug = require('debug');

var Integration = Service.extend({

  channelName: 'checkout',

  constructor: function(){
    Service.apply( this, arguments );
    if( ! this.id ){
      throw new Error('Gateway id required');
    }

    var events = {};
    this.debug = debug( this.id );

    // gateway view events
    events['gateway:' + this.id] = function( view ){
      view.once( 'show', this.onShow, this );
      view.once( 'destroy', this.onDestroy, this );
    }.bind(this);

    // process order button clicked
    events['order:payment:' + this.id] = this.onSubmit;

    this.channel.on(events, this);
  },

  onShow: function(){},
  onDestroy: function(){},
  onSubmit: function(){}

});

App.prototype.set('POSApp.Checkout.Integration', Integration);