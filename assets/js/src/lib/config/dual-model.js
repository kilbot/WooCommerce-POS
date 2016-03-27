var bb = require('backbone');
var IDBModel = require('./idb-model');
var _ = require('lodash');
var app = require('./application');

module.exports = app.prototype.DualModel = IDBModel.extend({

  idAttribute: 'local_id',

  remoteIdAttribute: 'id',

  isDelayed: function(state){
    state = state || this.get('_state');
    return _.includes(this.collection.states, state);
  },

  url: function(){
    var remoteId = this.get(this.remoteIdAttribute),
      urlRoot = _.result(this.collection, 'url');

    if(remoteId){
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  fetch: function(options){
    var self = this, isNew = this.collection.isNew();
    return this.sync('read', this, options)
      .then(function(response){
        if(!response) {
          options.remote = true;
          return self.sync('read', this, options);
        }
        return response;
      })
      .then(function(response){
        if(isNew){
          self.collection.fullSync();
        }
        return response;
      });
  },

  sync: function( method, model, options ){
    options = options || {};
    if( method !== 'read' ){
      this.setLocalState( method );
    }
    if( options.remote ){
      return this.remoteSync( method, model, options );
    }
    return bb.sync.call( this, method, model, options );
  },

  remoteSync: function( method, model, options ){
    var self = this, opts = _.extend({}, options, {
      remote: false,
      success: false
    });
    return bb.sync.call( this, method, model, opts )
      .then( function(){
        var remoteMethod = self.getRemoteMethod();
        opts.remote = true;
        return bb.sync.call( self, remoteMethod, model, opts );
      })
      .then( function( resp ){
        resp = options.parse ? model.parse(resp, options) : resp;
        model.set( resp );
        opts.remote = false;
        opts.success = options.success;
        return bb.sync.call( self, 'update', model, opts );
      });
  },

  setLocalState: function( method ){
    method = method === 'patch' ? 'update' : method;
    if( method === 'update' && !this.hasRemoteId() ){
      method = 'create';
    }
    if( method === 'create' && this.hasRemoteId() ){
      method = 'update';
    }
    this.set({ _state: this.collection.states[method] });
  },

  getRemoteMethod: function(){
    return _.invert( this.collection.states )[ this.get('_state') ];
  },

  hasRemoteId: function() {
    return !!this.get( this.remoteIdAttribute );
  },

  toJSON: function( options ){
    options = options || {};
    var json = IDBModel.prototype.toJSON.apply( this, arguments );
    if( options.remote && this.name ) {
      json = this.prepareRemoteJSON(json);
    }
    return json;
  },

  prepareRemoteJSON: function(json){
    json._state = undefined;
    var nested = {};
    nested[this.name] = json;
    return nested;
  },

  parse: function( resp, options ) {
    options = options || {};
    if( options.remote ){
      resp = resp && resp[this.name] ? resp[this.name] : resp;
      resp._state = undefined;
    }
    return IDBModel.prototype.parse.call( this, resp, options );
  }

});