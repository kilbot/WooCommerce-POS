var Module = require('lib/config/module');
var Products = require('./products/collection');
var Cart = require('./cart/collection');
var Orders = require('./orders/collection');
var Order = require('./orders/model');
var Settings = require('./settings');
var bb = require('backbone');

module.exports = Module.extend({

  initialize: function() {
    this.channel = bb.Radio.channel('entities');

    this.channel.reply({
      'products': function() {
        return new Products();
      },
      'cart': function( options ) {
        return new Cart( [], options );
      },
      'order': function(id) {
        return new Order(id);
      },
      'orders': function() {
        return new Orders();
      },
      'get:options': function(key){
        return this.app.options[key];
      },
      'set:options': function(key){
        return key;
      },
      'get:settings': function(key){
        if( key === 'hotkeys' ){
          return new Settings.Usermeta( this.app.options['hotkeys'],
              { id: 'hotkeys' }
          );
        }
      }
    }, this);
  }

});