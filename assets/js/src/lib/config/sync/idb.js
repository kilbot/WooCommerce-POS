/**
 * Backbone adapter for idb-wrapper api
 */
var IDBStore = require('idb-wrapper');
var $ = require('jquery');
var _ = require('lodash');
var debug = require('debug')('idb');
var noop = function (){};

function IndexedDB(parent) {

  var defaults = {
    storeName     : 'store',
    storePrefix   : 'wc_pos_',
    dbVersion     : 1,
    keyPath       : 'local_id',
    autoIncrement : true,
    indexes       : [
      {name: 'local_id', keyPath: 'local_id', unique: true},
      {name: 'id', keyPath: 'id', unique: true},
      {name: 'status', keyPath: 'status', unique: false}
    ]
  };

  this.options = _.defaults({
    storeName     : parent.name,
    dbVersion     : parent.dbVersion,
    keyPath       : parent.keyPath,
    autoIncrement : parent.autoIncrement,
    indexes       : parent.indexes
  }, defaults);

  if(parent.storage && parent.storage === 'dual'){
    this.dualStorage = true;
    this.states = parent.states;
  }

}

var methods = {

  /**
   * Add a new model to the store
   *
   * @param {Backbone.Model} model - Backbone model to add to store
   * @param {Object} options - sync options created by Backbone
   * @param {Function} [options.success] - overridable success callback
   * @param {Function} [options.error] - overridable error callback
   */
  create: function(model, options) {
    var data = model.attributes,
        keyPath = this.options.keyPath;

    if(this.dualStorage){
      model.set('status', this.states.CREATE_FAILED);
    }

    this.store.put(data, function(insertedId) {
      data[keyPath] = insertedId;
      options.success(data);
    }, options.error);

  },

  /**
   * Update a model in the store
   *
   * @param {Backbone.Model} model - Backbone model to update and save to store
   * @param {Object} options - sync options created by Backbone
   * @param {Function} [options.success] - overridable success callback
   * @param {Function} [options.error] - overridable error callback
   */
  update: function(model, options) {
    if(this.dualStorage && model.hasRemoteId()) {
      model.set('status', this.states.UPDATE_FAILED);
    }
    this.store.put(model.attributes, options.success, options.error);
  },

  /**
   * Retrieve a model from the store
   *
   * @param {Backbone.Model} model - Backbone model to get from store
   * @param {Object} options - sync options created by Backbone
   * @param {Function} [options.success] - overridable success callback
   * @param {Function} [options.error] - overridable error callback
   */
  read: function(model, options) {
    this.store.get(model.id, options.success, options.error);
  },

  /**
   * Retrieve a collection from the store
   *
   * @param {Object} options - sync options created by Backbone
   * @param {Function} [options.success] - overridable success callback
   * @param {Function} [options.error] - overridable error callback
   */
  getAll: function(options) {

    if(this.dualStorage){
      var data = [];
      return this.iterate(function(item) {
        if (item.status !== 'DELETE_FAILED') {
          return data.push(item);
        }
      }, {
        onEnd: function() {
          return options.success(data);
        }
      });
    } else {
      this.store.getAll(options.success, options.error);
    }

  },

  /**
   * Delete a model from the store
   *
   * @param {Backbone.Model} model - Backbone model to delete from store
   * @param {Object} options - sync options created by Backbone
   * @param {Function} [options.success] - overridable success callback
   * @param {Function} [options.error] - overridable error callback
   */
  destroy: function(model, options) {
    if (model.isNew()) {
      return false;
    }

    if(this.dualStorage && model.hasRemoteId()){
      model.set('status', this.states.DELETE_FAILED);
      this.store.put(model.attributes, options.success, options.error);
    } else {
      this.store.remove(model.id, options.success, options.error);
    }

  },

  /**
   * Iterates over the store using the given options and calling onItem
   * for each entry matching the options.
   *
   * @param {Function} onItem - A callback to be called for each match
   * @param {Object} [options] - An object defining specific options
   * @param {Object} [options.index=null] - An IDBIndex to operate on
   * @param {String} [options.order=ASC] - The order in which to provide the
   *  results, can be 'DESC' or 'ASC'
   * @param {Boolean} [options.autoContinue=true] - Whether to automatically
   *  iterate the cursor to the next result
   * @param {Boolean} [options.filterDuplicates=false] - Whether to exclude
   *  duplicate matches
   * @param {Object} [options.keyRange=null] - An IDBKeyRange to use
   * @param {Boolean} [options.writeAccess=false] - Whether grant write access
   *  to the store in the onItem callback
   * @param {Function} [options.onEnd=null] - A callback to be called after
   *  iteration has ended
   * @param {Function} [options.onError=throw] - A callback to be called
   *  if an error occurred during the operation.
   */
  iterate: function(onItem, options) {
    if (options.keyRange && !(options.keyRange instanceof global.IDBKeyRange)) {
      options.keyRange = this.makeKeyRange(options.keyRange);
    }

    this.store.iterate(onItem, options);
  },

  /**
   * Creates a key range using specified options. This key range can be
   * handed over to the count() and iterate() methods.
   *
   * Note: You must provide at least one or both of "lower" or "upper" value.
   *
   * @param {Object} options The options for the key range to create
   * @param {*} [options.lower] The lower bound
   * @param {Boolean} [options.excludeLower] Whether to exclude the lower
   *  bound passed in options.lower from the key range
   * @param {*} [options.upper] The upper bound
   * @param {Boolean} [options.excludeUpper] Whether to exclude the upper
   *  bound passed in options.upper from the key range
   * @param {*} [options.only] A single key value. Use this if you need a key
   *  range that only includes one value for a key. Providing this
   *  property invalidates all other properties.
   * @return {Object} The IDBKeyRange representing the specified options
   */
  makeKeyRange: function(options) {
    return this.store.makeKeyRange(options);
  },

  /**
   * Perform a batch operation to save all models in the current collection to
   * indexedDB.
   *
   * @param {Function} [onSuccess] - success callback
   * @param {Function} [onError] - error callback
   */
  saveAll: function(onSuccess, onError) {
    onSuccess = onSuccess || noop;
    onError = onError || this.options.onError;

    this.store.putBatch(this.parent.toJSON(), onSuccess, onError);
  },

  /**
   * Perform a batch operation to save and/or remove models in the current
   * collection to indexedDB. This is a proxy to the idbstore `batch` method
   *
   * @param {Array} dataArray - Array of objects containing the operation
   * to run and the model (for put operations).
   * @param {Function} [onSuccess] - success callback
   * @param {Function} [onError] - error callback
   */
  batch: function(dataArray, onSuccess, onError) {
    onSuccess = onSuccess || noop;
    onError = onError || this.options.onError;

    this.store.batch(dataArray, onSuccess, onError);
  },

  /**
   * Perform a batch put operation to save models to indexedDB. This is a
   * proxy to the idbstore `putBatch` method
   *
   * @param {Array} dataArray - Array of models (in JSON) to store
   * @param {Function} [onSuccess] - success callback
   * @param {Function} [onError] - error callback
   */
  putBatch: function(dataArray, onSuccess, onError) {
    onSuccess = onSuccess || noop;
    onError = onError || this.options.onError;

    this.store.putBatch(dataArray, onSuccess, onError);
  },

  /**
   * Perform a batch operation to remove models from indexedDB. This is a
   * proxy to the idbstore `removeBatch` method
   *
   * @param {Array} keyArray - keyArray An array of keys to remove
   * @param {Function} [onSuccess] - success callback
   * @param {Function} [onError] - error callback
   */
  removeBatch: function(keyArray, onSuccess, onError) {
    onSuccess = onSuccess || noop;
    onError = onError || this.options.onError;

    this.store.removeBatch(keyArray, onSuccess, onError);
  },

  /**
   * Clears all content from the current indexedDB for this collection/model
   *
   * @param {Function} [onSuccess] - success callback
   * @param {Function} [onError] - error callback
   */
  clear: function(onSuccess, onError) {
    onSuccess = onSuccess || noop;
    onError = onError || this.options.onError;

    this.store.clear(onSuccess, onError);
  },

  /**
   * Deletes the current indexedDB for this collection/model
   */
  deleteDatabase: function() {
    this.store.deleteDatabase();
  },

  /**
   * Promisify
   */
  open: function () {
    if(this._open){ return this._open; }
    var deferred = new $.Deferred(),
        options = this.options || {};

    options.onStoreReady = function () {
      debug(options.storeName + ' open');
      deferred.resolve();
    };

    options.onError = function (err) {
      debug(err.type, err);
      deferred.reject(err);
    };

    this.store = new IDBStore(options);

    this._open = deferred.promise();
    return this._open;
  },

  put: function (key, value) {
    var deferred = new $.Deferred();
    var onSuccess = deferred.resolve;
    var onError = deferred.reject;

    if (this.options.keyPath !== null) {
      // in-line keys: one arg only (key == value)
      this.store.put(key, onSuccess, onError);
    } else {
      // out-of-line keys: two args
      this.store.put(key, value, onSuccess, onError);
    }

    return deferred.promise();
  },

  get: function (key) {
    var deferred = new $.Deferred();
    var onSuccess = deferred.resolve;
    var onError = deferred.reject;

    this.store.get(key, onSuccess, onError);

    return deferred.promise();
  },

  remove: function (key) {
    var deferred = new $.Deferred();
    var onSuccess = deferred.resolve;
    var onError = deferred.reject;

    this.store.remove(key, onSuccess, onError);

    return deferred.promise();
  },

  /**
   * select records by {key: value}
   */
  getByAttribute: function(attribute){
    var deferred = new $.Deferred();
    var onSuccess = deferred.resolve;
    var onError = deferred.reject;

    var keyRange = this.store.makeKeyRange({
      only: _.chain(attribute).values().first().value()
    });

    this.store.query(onSuccess, {
      index: _.chain(attribute).keys().first().value(),
      keyRange: keyRange,
      onError: onError
    });

    return deferred.promise();
  }

  /**
   * returns latest `updated_at`
   */
  //getLastUpdate: function(){
  //  var deferred = new $.Deferred();
  //  var onItem = function (item) {
  //    debugger;
  //    return deferred.resolve(item.updated_at, item);
  //  };
  //  var onError = function (err) {
  //    deferred.reject(err);
  //  };
  //
  //  this.store.iterate(onItem, {
  //    index: 'updated_at',
  //    order: 'DESC',
  //    onError: onError
  //  });
  //
  //  return deferred.promise();
  //}

  // });
};

_.extend(IndexedDB.prototype, methods);
module.exports = IndexedDB;