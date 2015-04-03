/**
 * TODO: merge sync/idb.js & sync/idbsync.js
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
   *
   */
  mergeRecords: function(records){
    var merge = _.map(records, this.mergeRecord, this);
    return $.when.apply(this, merge)
      .done(function(){
        debug('All records merged', arguments);
      })
      .fail(function(err){
        debug('Error merging records', err);
      });
  },

  /**
   * - get the local_id (if record already stored locally)
   * - mix local_id into server response
   * - save to idb
   * - get updated record
   * - merge updated/new record into collection
   * todo: `put` should return full model?
   */
  mergeRecord: function(record){
    var self      = this,
        keyPath   = this.keyPath;

    return $.when( this.indexedDB.getByAttribute({ id: record.id }) )
      .then(function(array){
        var local = _.first(array);
        if(local){ record[keyPath] = local[keyPath]; }
        return self.indexedDB.put(record);
      })
      .then(function(id){
        return self.indexedDB.get(id);
      })
      .then(function(model){
        return self.add(model, {merge: true});
      })
      .done(function(model){
        debug('Record merged', model);
      })
      .fail(function(err){
        debug('Error merging record', err);
      });
  }

});