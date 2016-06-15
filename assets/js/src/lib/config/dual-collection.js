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
    var collection = this, success = options.success;
    var _fetch = options.remote ? this.fetchRemote : this.fetchLocal;
    options.success = undefined;

    if(this.pageSize){
      var limit = _.get(options, ['data', 'filter', 'limit']);
      if(!limit) { _.set(options, 'data.filter.limit', this.pageSize); }
    }

    return _fetch.call(this, options)
      .then(function (response) {
        var method = options.reset ? 'reset' : 'set';
        collection._parseFetchOptions(options);
        collection[method](response, options);
        if (success) {
          success.call(options.context, collection, response, options);
        }
        collection.trigger('sync', collection, response, options);
        return response;
      });
  },
  /* jshint +W071, +W074 */

  /**
   *
   */
  fetchLocal: function (options) {
    var collection = this, isNew = this.isNew();
    _.extend(options, {set: false});
    return this.sync('read', this, options)
      .then(function (response) {
        if(options.remote === false) { return response; }
        if(_.size(response) === 0 && (isNew || collection._delayed !== 0)) {
          return collection.fetchRemote(options);
        }
        return collection.fetchReadDelayed(response);
      })
      .then(function(response){
        if(isNew && options.fullSync !== false) { collection.fullSync(); }
        return response;
      });
  },

  /**
   * Get remote data and merge with local data on id
   * returns merged data
   */
  fetchRemote: function (options) {
    var collection = this;
    _.extend(options, { remote: true, set: false });

    return this.sync('read', this, options)
      .then(function (response) {
        response = collection.parse(response, options);
        options.index = options.index || 'id';
        _.extend(options, { remote: false });
        return collection.save(response, options);
      });
  },

  /**
   *
   */
  fetchRemoteIds: function (last_update, options) {
    options = options || {};
    var collection = this, url = _.result(this, 'url') + '/ids';

    _.extend(options, {
      url   : url,
      data  : {
        fields: 'id',
        filter: {
          limit         : -1,
          updated_at_min: last_update
        }
      },
      index: {
        keyPath: 'id',
        merge  : function (local, remote) {
          if(!local || local.updated_at < remote.updated_at){
            local = local || remote;
            local._state = collection.states.read;
          }
          return local;
        }
      },
      success: undefined
    });

    return this.fetchRemote(options);
  },

  /**
   *
   */
  fetchUpdatedIds: function (options) {
    var collection = this;
    return this.fetchLocal({
        index    : 'updated_at',
        data     : { filter: { limit: 1, order: 'DESC' } },
        fullSync : false
      })
      .then(function (response) {
        var last_update = _.get(response, [0, 'updated_at']);
        return collection.fetchRemoteIds(last_update, options);
      });
  },

  // fullSync: function(options){
  //   options = options || {};
  //   var collection = this;
  //   return this.fetchRemoteIds(null, options)
  //     .then(function(response){
  //       collection._parseFetchOptions(options);
  //       collection.trigger('sync', collection, response, options);
  //     });
  // },

  fullSync: function(options){
    var collection = this;
    return this.fetchRemoteIds(null, options)
      .then(function(response){
        return collection.destroy(null, {
          index: 'id',
          data: {
            filter: {
              not_in: _.map(response, 'id')
            }
          }
        });
      });
  },

  fetchReadDelayed: function(response){
    var delayed = this.getDelayed('read', response);
    if(!_.isEmpty(delayed)){
      var ids = _.map(delayed, 'id');
      return this.fetchRemote({ data: { filter: { 'in': ids.join(',') } } })
        .then(function(resp){
          _.each(resp, function(attrs){
            var key = _.findKey(response, {id: attrs.id});
            if(key){ response[key] = attrs; } else { response.push(resp); }
          });
          return response;
        });
    }
    return response;
  },

  getDelayed: function(state, collection){
    var _state = this.states[state];
    collection = collection || this;
    return _.filter(collection, {_state: _state});
  },

  _parseFetchOptions: function(options){
    options = options || {};
    if(options.idb){
      this._total = options.idb.total;
      this._delayed = options.idb.delayed;
    }
    if(options.xhr){
      this._total = parseInt( options.xhr.getResponseHeader('X-WC-Total') );
    }
  },

  hasNextPage: function(){
    return this.length < this._total;
  }

});