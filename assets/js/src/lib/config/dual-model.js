var Model = require('./model');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var debug = require('debug')('dualModel');

module.exports = POS.DualModel = Model.extend({
  idAttribute: 'local_id',
  remoteIdAttribute: 'id',
  fields: ['title'],

  url: function(){
    var remoteId = this.get(this.remoteIdAttribute),
        urlRoot = _.result(this.collection, 'url');

    if(remoteId){
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  states: {
    SYNCHRONIZED  : 'SYNCHRONIZED',
    SYNCHRONIZING : 'SYNCHRONIZING',
    UPDATE_FAILED : 'UPDATE_FAILED',
    CREATE_FAILED : 'CREATE_FAILED',
    DELETE_FAILED : 'DELETE_FAILED'
  },

  hasRemoteId: function() {
    return !!this.get(this.remoteIdAttribute);
  },

  getUrlForSync: function(urlRoot, method) {
    var remoteId = this.get(this.remoteIdAttribute);
    if (remoteId && (method === 'update' || method === 'delete')) {
      return '' + urlRoot + '/' + remoteId + '/';
    }
    return urlRoot;
  },

  getSyncMethodsByState: function(state){
    var methods = {};
    methods[this.states.CREATE_FAILED] = 'create';
    methods[this.states.UPDATE_FAILED] = 'update';
    methods[this.states.DELETE_FAILED] = 'delete';
    return methods[state];
  },

  isInSynchronizing: function() {
    return this.get('status') === this.states.SYNCHRONIZING;
  },

  isDelayed: function() {
    var status = this.get('status');
    return status === this.states.DELETE_FAILED ||
           status === this.states.UPDATE_FAILED ||
           status === this.states.CREATE_FAILED;
  },

  remoteSync: function(options){
    options = options || {};
    var self      = this,
        status    = this.get('status'),
        method    = this.getSyncMethodsByState(status),
        keyPath   = this.collection.keyPath,
        local_id  = this.get(keyPath);

    options.remote = true;

    return this.sync(method, this, options)
      .then(function(response){
        if (method === 'delete') {
          return self.destroy();
        }
        var attributes = self.parse(response);
        if(local_id){ attributes[keyPath] = local_id; }
        if(!attributes.status) { attributes.status = ''; }
        return self.collection.mergeRecord(attributes);
      })
      .done(function(model){
        debug('remote sync done', model);
      })
      .fail(function(err){
        debug('remote sync fail', err);
      });

  },

  save: function(attributes, options){
    options = options || {};
    var self = this, remote;

    if(options.remote){
      remote = true;
      options.remote = undefined; // prevent remote flag going through to sync
    }

    return Model.prototype.save.call(this, attributes, options)
      .then(function(){
        if(remote){
          return self.remoteSync();
        }
      })
      .done(function(model){
        debug('model saved', model);
      })
      .fail(function(err){
        debug('error saving model', err);
      });

  }

});