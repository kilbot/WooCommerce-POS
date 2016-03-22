/**
 * Dual Collection makes sure the data locally and the data on the server
 * stay in sync.
 */

var IDBCollection = require('./idb-collection');
var DualModel = require('./dual-model');
var _ = require('lodash');
var app = require('./application');
var Radio = require('backbone.radio');
//var debug = require('debug')('dualCollection');

module.exports = app.prototype.DualCollection = IDBCollection.extend({

  model: DualModel,

  keyPath: 'local_id',

  indexes: [
    {name: 'id', keyPath: 'id', unique: true},
    {name: 'updated_at', keyPath: 'updated_at'},
    {name: '_state', keyPath: '_state'}
  ],

  pageSize: 10,

  // delayed states
  states: {
    //'patch'  : 'UPDATE_FAILED',
    'update': 'UPDATE_FAILED',
    'create': 'CREATE_FAILED',
    'delete': 'DELETE_FAILED',
    'read'  : 'READ_FAILED'
  },

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + this.name;
  },

  toJSON: function (options) {
    options = options || {};
    var json = IDBCollection.prototype.toJSON.apply(this, arguments);
    if (options.remote && this.name) {
      var nested = {};
      nested[this.name] = json;
      return nested;
    }
    return json;
  },

  parse: function (resp, options) {
    options = options || {};
    if (options.remote) {
      resp = resp && resp[this.name] ? resp[this.name] : resp;
    }
    return IDBCollection.prototype.parse.call(this, resp, options);
  },

  /* jshint -W071, -W074 */
  fetch: function (options) {
    options = _.extend({parse: true}, options);
    var self = this, success = options.success;
    var _fetch = options.remote ? this.fetchRemote : this.fetchLocal;

    if(success){
      options.success = undefined;
    }

    return _fetch.call(this, options)
      .then(function (response) {
        var method = options.reset ? 'reset' : 'set';
        self[method](response, options);
        if (success) {
          success.call(options.context, self, response, options);
        }
        if(options.idb){
          self.total = options.idb.total;
          self.delayed = options.idb.delayed;
          self._hasNextPage = self.length < self.total || self.delayed > 0;
        }
        if(options.xhr){
          self.total = options.xhr.getResponseHeader('X-WC-Total');
          self._hasNextPage = self.length < self.total;
        }
        self.trigger('sync', self, response, options);
        return response;
      });
  },
  /* jshint +W071, +W074 */

  /**
   *
   */
  fetchLocal: function (options) {
    var self = this;
    options = options || {};

    return IDBCollection.prototype.getBatch.call(this, options)
      .then(function (response) {
        if(_.size(response) > 0){
          return self.fetchDelayed(response);
        }
        if(self.isNew()){
          return self.firstSync(options);
        }
        return self.fetchRemote(options);
      });
  },

  /**
   * Get remote data and merge with local data on id
   * returns merged data
   */
  fetchRemote: function (options) {
    // options = _.extend({remote: true}, options);
    options = options || {};
    options.remote = true;
    var self = this;

    this.trigger('request', this, null, options);
    return this.sync('read', this, options)
      .then(function (response) {
        response = self.parse(response, options);
        return self.putBatch(response, { index: 'id' });
      })
      .then(function (keys) {
        return self.getBatch(keys);
      });
  },

  fetchRemoteIds: function (last_update, options) {
    options = options || {};
    var self = this, url = _.result(this, 'url') + '/ids';

    var opts = _.defaults(options, {
      url   : url,
      remote: true,
      data  : {
        fields: 'id',
        filter: {
          limit         : -1,
          updated_at_min: last_update
        }
      }
    });

    opts.success = undefined;

    return this.sync('read', this, opts)
      .then(function (response) {
        response = self.parse(response, opts);
        return self.putBatch(response, {
          index: {
            keyPath: 'id',
            merge  : function (local, remote) {
              if(!local || local.updated_at < remote.updated_at){
                local = local || remote;
                local._state = self.states.read;
              }
              return local;
            }
          }
        });
      })
      .then(function (response) {
        return response;
      });
  },

  fetchUpdatedIds: function (options) {
    var self = this;
    return this.findHighestIndex('updated_at')
      .then(function (last_update) {
        return self.fetchRemoteIds(last_update, options);
      });
  },

  firstSync: function(options){
    var self = this;
    return this.fetchRemote(options)
      .then(function (response) {
        self.fullSync();
        return response;
      });
  },

  fullSync: function(options){
    return this.fetchRemoteIds(options);
  },

  fetchDelayed: function(response){
    var delayed = this.getDelayed('read', response);
    if(delayed){
      var ids = _.map(delayed, 'id');
      return this.fetchRemote({
          data: {
            filter: {
              'in': ids.join(',')
            }
          }
        })
        .then(function(resp){
          _.each(resp, function(attrs){
            var key = _.findKey(response, {id: attrs.id});
            if(key){
              response[key] = attrs;
            } else {
              response.push(resp);
            }
          });
          return response;
        });
    }
    return response;
  },

  getDelayed: function(state, collection){
    var delayed, _state = this.states[state];
    collection = collection || this;
    delayed = _.filter(collection, {_state: _state});
    if(!_.isEmpty(delayed)){
      return delayed;
    }
  }

});