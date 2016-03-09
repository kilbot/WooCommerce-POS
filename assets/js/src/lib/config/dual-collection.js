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

  firstSync: function () {
    var self = this;
    return this.fetch()
      .then(function(records){
        if(_.isEmpty(records)){
          return self.fetchRemote();
        }
      })
      .then(function(){
        self.fullSync();
      });
  },

  fullSync: function () {
    var self = this;
    return this.fetchRemoteIds()
      .then(function () {
        return self.count();
      });
  },

  fetch: function (options) {
    options = options || {};
    if (options.remote) {
      return this.fetchRemote(options);
    }
    return IDBCollection.prototype.fetch.call(this, options);
  },

  fetchRemote: function (options) {
    options = options || {};
    var self = this;
    var opts = _.extend({}, options, {
      remove : false,
      remote : true,
      success: undefined
    });

    return this.sync('read', this, opts)
      .then(function (response) {
        response = self.parse(response, opts);
        return self.putBatch(response, {
          index: 'id'
        });
      })
      .then(function (response) {
        self.set(response, {remove: false});
        if (options.success) {
          options.success.call(options.context, self, response, options);
        }
        return response;
      });
  },

  fetchRemoteIds: function (last_update, options) {
    options = options || {};
    var self = this, url = _.result(this, 'url') + '/ids';

    var opts = _.defaults(options, {
      url   : url,
      remote: true,
      data  : {
        fields: ['id', 'updated_at'],
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
              var updated_at = _.has(local, 'updated_at') ? local.updated_at : undefined;
              var data = _.merge({}, local, remote);
              if (_.isUndefined(data.local_id) || updated_at !== data.updated_at) {
                data._state = self.states.read;
              }
              return data;
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
    return this.db.findHighestIndex('updated_at')
      .then(function (last_update) {
        return self.fetchRemoteIds(last_update, options);
      });
  }

});