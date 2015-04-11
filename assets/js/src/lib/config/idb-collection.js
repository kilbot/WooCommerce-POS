/**
 * TODO: merge sync/idb.js & sync/idbsync.js?
 */

var Collection = require('./collection');
var debug = require('debug')('idbCollection');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var _ = require('lodash');
var IndexedDB = require('./sync/idb');

module.exports = POS.IndexedDBCollection = Collection.extend({

  constructor: function() {
    Collection.apply(this, arguments);
    this.indexedDB = new IndexedDB(this);
    this.indexedDB.open();
  },

  /**
   * merge array of records
   */
  mergeRecords: function(records){
    var self = this;

    var merge = _.map(records, this._mergeRecord, this);
    return $.when.apply(this, merge)
      .then(function(){
        var models = Array.prototype.slice.call(arguments);
        return self.add(models, {merge: true});
      })
      .done(function(){
        debug('All records merged', arguments);
      })
      .fail(function(err){
        debug('Error merging records', err);
      });
  },

  /**
   * merge single record
   */
  mergeRecord: function(record){
    var self = this;

    return this._mergeRecord(record)
      .then(function(model){
        return self.add(model, {merge: true });
      })
      .done(function(model){
        debug('Record merged', model);
      })
      .fail(function(err){
        debug('Error merging record', err);
      });
  },

  /**
   * - get the local_id (if record already stored locally)
   * - mix local_id into server response
   * - save to idb
   * - get updated record
   * todo: putBatch?
   * todo: `put` should return full model?
   */
  _mergeRecord: function(record){
    var self    = this,
        keyPath = this.keyPath;

    return this.indexedDB.getByAttribute({ id: record.id })
      .then(function(array){
        var local = _.first(array);
        if(local){ record[keyPath] = local[keyPath]; }
        return self.indexedDB.put(record);
      })
      .then(function(id){
        return self.indexedDB.get(id);
      })
      .done(function(model){
        debug('Record merged with idb', model);
      })
      .fail(function(err){
        debug('Error merging record with idb', err);
      });
  }

});