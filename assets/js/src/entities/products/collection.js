var Backbone = require('backbone');
var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
//var IndexedDB = require('lib/config/indexeddb');
var _ = require('lodash');

module.exports = DualCollection.extend({
  name: 'products',
  model: Model,

  initialize: function(){
    this.indexedDB = new Backbone.IndexedDB({
      storeName: 'products',
      storePrefix: 'wc_pos_',
      dualStorage: true,
      dbVersion: 1,
      keyPath: 'local_id',
      autoIncrement: true,
      indexes: [
        {name: 'local_id', keyPath: 'local_id', unique: true},
        {name: 'id', keyPath: 'id', unique: true},
        {name: 'status', keyPath: 'status', unique: false}
      ]
    }, this);

    //this.indexedDB.sayHello();

    //
    this.on( 'remote:sync', this.remoteSync );
  },

  parse: function (resp) {
    if( resp.products ){
      this.serverResponse(resp);
      return resp.products;
    } else {
      return resp;
    }
  },

  serverResponse: function(resp){
    var variable = _.where(resp.products, { type: 'variable' });
    _.each( variable, function( product ) {
      _.each( product.variations, function( variation ){
        variation.type      = 'variation';
        variation.title     = product.title;
        variation.parent    = product.id;
        variation.categories= product.categories;
        resp.products.push( variation );
      });
    });
  },

  remoteSync: function(){
    this.fullSync()
      .done( function() {

      });
      //.fail( function( item, jqXHR, textStatus, errorThrown ){
      //  // error alert
      //  var errors = POS.Utils.parseErrorResponse( jqXHR );
      //  POS.Components.Alerts.channel.command( 'open:alert', {
      //    type: 'danger',
      //    title: item.title,
      //    message: errors
      //  });
      //});
  }

});