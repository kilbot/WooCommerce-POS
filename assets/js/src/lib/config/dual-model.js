var DeepModel = require('./deep-model');
var app = require('./application');
var _ = require('lodash');
var debug = require('debug')('dualModel');

module.exports = app.prototype.DualModel = DeepModel.extend({

  idAttribute: 'local_id',

  remoteIdAttribute: 'id',

  fields: ['title'],

  defaults: {
    status: 'CREATE_FAILED'
  },

//validate: function(attrs){
//  var obj = {};
//  if(attrs[this.idAttribute]) {
//    obj[this.idAttribute] = parseInt(attrs[this.idAttribute], 10);
//  }
//  if(attrs[this.remoteIdAttribute]){
//    obj[this.remoteIdAttribute] = parseInt(attrs[this.remoteIdAttribute], 10);
//  }
//  this.set(obj, {silent: true});
//},

  url: function(){
    var remoteId = this.get(this.remoteIdAttribute),
        urlRoot = _.result(this.collection, 'url');

    if(remoteId){
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  // delayed states
  states: {
    //'patch'  : 'UPDATE_FAILED',
    'update' : 'UPDATE_FAILED',
    'create' : 'CREATE_FAILED',
    'delete' : 'DELETE_FAILED'
  },

  hasRemoteId: function() {
    return !!this.get(this.remoteIdAttribute);
  },

  isDelayed: function( status ) {
    status = status || this.get('status');
    return status === this.states['update'] ||
           status === this.states['create'] ||
           status === this.states['delete'];
  },

  /**
   * - sync to idb with correct status
   * - if remote, sync to remote
   */
  sync: function(method, model, options){
    options = options || {};
    var opts = _.clone(options);
    opts.remote = undefined;
    var m = method === 'patch' ? 'update' : method;

    this.setStatus(m);

    return DeepModel.prototype.sync.call(this, m, model, opts)
      .then(function(){
        if(options.remote){
          return model.remoteSync(method, model, options);
        }
      });
  },

  remoteSync: function(method, model, options){
    model = model || this;
    options = options || {};
    options.remote = true;
    method = method || model.getMethod();

    return DeepModel.prototype.sync.call(this, method, model, options)
      .then(function(resp){
        if(resp){
          var data = model.parse(resp);
          return model.merge(data);
        }
      });
  },

  setStatus: function(method){
    if(this.states[method]){
      if(method === 'update' && !this.hasRemoteId()){
        method = 'create';
      }
      this.set({ status: this.states[method] });
    }
  },

  getMethod: function(){
    var status = this.get('status');
    var remoteMethod = _.findKey(this.states, function(state) {
      return state === status;
    });
    if(remoteMethod){
      return remoteMethod;
    } else {
      debug('No method given for remote sync');
    }
  },

  merge: function(resp){
    // todo: merge
    // - merge should take bb & json?
    this.set(resp);
    if(this.isDelayed()){
      this.unset('status');
    }
    if(this.collection && this.collection.db){
      return this.collection.merge( this.toJSON() );
    }
  }

});