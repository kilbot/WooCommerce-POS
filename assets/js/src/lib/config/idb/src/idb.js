/**
 * Backbone adapter for idb-wrapper api
 */
var IDBStore = require('idb-wrapper');
var $ = require('jquery');
var _ = require('underscore');
var bb = require('backbone');
var noop = function (){};
var defaultErrorHandler = function (error) {
  throw error;
};

function IndexedDB(options, parent) {
  this.parent = parent;
  this.options = options;
  if(options.defaultErrorHandler){
    defaultErrorHandler = options.defaultErrorHandler;
  }
}

var methods = {

  /**
   *
   */
  open: function () {
    if(this._open){
      return this._open;
    }
    var deferred = new $.Deferred(),
        options = this.options || {};

    options.onStoreReady = deferred.resolve;
    options.onError = deferred.reject;

    this.store = new IDBStore(options);

    this._open = deferred.promise();
    return this._open;
  },

  /**
   * Add a new model to the store
   */
  create: function(model, options) {
    options = options || {};
    var onSuccess = options.success || noop,
        onError = options.error || defaultErrorHandler,
        data = this._returnAttributes(model),
        keyPath = this.store.keyPath;

    return this.put(data)
      .then(function(insertedId){
        data[keyPath] = insertedId;
        onSuccess(data);
        return data;
      })
      .fail(onError);
  },

  /**
   * Update a model in the store
   */
  update: function(model, options) {
    options = options || {};
    var onSuccess = options.success || noop,
        onError = options.error || defaultErrorHandler,
        data = this._returnAttributes(model),
        self = this;

    return this.put(data)
      .then(function(insertedId){
        return self.get(insertedId)
          .done(onSuccess)
          .fail(onError);
      })
      .fail(onError);
  },

  /**
   * Retrieve a model from the store
   */
  read: function(model, options) {
    options = options || {};
    var onSuccess = options.success || noop,
        onError = options.error || defaultErrorHandler;
    return this.get(model.id)
      .done(onSuccess)
      .fail(onError);
  },

  /**
   * Delete a model from the store
   */
  destroy: function(model, options) {
    if (model.isNew()) {
      return false;
    }
    options = options || {};
    var onSuccess = options.success || noop,
        onError = options.error || defaultErrorHandler;

    return this.remove(model.id)
      .done(onSuccess)
      .fail(onError);
  },

  /**
   *
   */
  put: function (key, value) {
    var deferred = new $.Deferred();

    if (this.store.keyPath !== null) {
      // in-line keys: one arg only (key == value)
      this.store.put(key, deferred.resolve, deferred.reject);
    } else {
      // out-of-line keys: two args
      this.store.put(key, value, deferred.resolve, deferred.reject);
    }

    return deferred.promise();
  },

  /**
   *
   */
  get: function (key) {
    var deferred = new $.Deferred();
    this.store.get(key, deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   *
   */
  remove: function(key){
    if( _.isObject(key) && key.hasOwnProperty(this.store.keyPath) ) {
      key = key[this.store.keyPath];
    }
    return this._remove(key);
  },

  _remove: function (key) {
    var deferred = new $.Deferred();
    this.store.remove(key, deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   * Retrieve a collection from the store
   */
  getAll: function(options) {
    var deferred = new $.Deferred();

    var onSuccess = function (result) {
      options.success.apply(this, arguments);
      deferred.resolve(result);
    };

    var onError = function (result) {
      options.error.apply(this, arguments);
      deferred.reject(result);
    };

    this.store.getAll(onSuccess, onError);

    return deferred.promise();
  },

  /**
   * Iterates over the store using the given options and calling onItem
   * for each entry matching the options.
   */
  iterate: function(options) {
    options = options || {};
    var deferred = new $.Deferred();
    options.onEnd = deferred.resolve;
    options.onError = deferred.reject;
    var onItem = deferred.notify;
    this.store.iterate(onItem, options);
    return deferred.promise();
  },

  /**
   * Creates a key range using specified options. This key range can be
   * handed over to the count() and iterate() methods.
   *
   * Note: You must provide at least one or both of "lower" or "upper" value.
   */
  makeKeyRange: function(options) {
    return this.store.makeKeyRange(options);
  },

  /**
   * Perform a batch operation to save all models in the current collection to
   * indexedDB.
   */
  saveAll: function() {
    return this.putBatch(this.parent.toJSON());
  },

  /**
   * Perform a batch operation to save and/or remove models in the current
   * collection to indexedDB. This is a proxy to the idbstore `batch` method
   */
  batch: function(dataArray) {
    var deferred = new $.Deferred();
    this.store.batch(dataArray, deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   * Perform a batch put operation to save models to indexedDB. This is a
   * proxy to the idbstore `putBatch` method
   */
  putBatch: function(dataArray) {
    if( !_.isArray(dataArray) ){
      return this.put(dataArray);
    }
    return this._putBatch(dataArray);
  },

  _putBatch: function(dataArray) {
    var deferred = new $.Deferred();
    this.store.putBatch(dataArray, deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   * Perform a batch operation to remove models from indexedDB. This is a
   * proxy to the idbstore `removeBatch` method
   */
  removeBatch: function(keyArray) {
    if( !_.isArray(keyArray) ){
      return this.remove(keyArray);
    }
    return this._removeBatch(keyArray);
  },

  _removeBatch: function(keyArray){
    var deferred = new $.Deferred();
    this.store.removeBatch(keyArray, deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   * Clears all content from the current indexedDB for this collection/model
   */
  clear: function() {
    var deferred = new $.Deferred();
    this.store.clear(deferred.resolve, deferred.reject);
    return deferred.promise();
  },

  /**
   *
   */
  query: function(index, keyRange){
    var deferred = new $.Deferred();

    this.store.query(deferred.resolve, {
      index: index,
      keyRange: keyRange,
      onError: deferred.reject
    });

    return deferred.promise();
  },

  /**
   * select records by {key: value}
   */
  getByAttribute: function(attribute){
    var index = _.chain(attribute).keys().first().value();
    var keyRange = this.store.makeKeyRange({
      only: _.chain(attribute).values().first().value()
    });
    return this.query(index, keyRange);
  },

  merge: function(models){
    models = !_.isArray(models) ? [models] : models;
    if(!this.parent.mergeKeyPath){
      return this.putBatch(models);
    }
    var merge = _.map(models, this._merge, this);
    return $.when.apply(this, merge);
  },

  _merge: function(model){
    var mergeKeyPath = this.parent.mergeKeyPath,
        keyPath = this.store.keyPath,
        self = this,
        opts = {};

    if(model[keyPath]){
      return this.update(model);
    }

    opts[mergeKeyPath] = model[mergeKeyPath];

    return this.getByAttribute(opts)
      .then(function(array){
        var local = _.first(array);
        if(local){
          model[keyPath] = local[keyPath];
          return self.update(model);
        }
        return self.create(model);
      });
  },

  _returnAttributes: function(model){
    if(model instanceof bb.Model){
      return model.toJSON();
    }
    return model;
  }
};

_.extend(IndexedDB.prototype, methods);
module.exports = IndexedDB;