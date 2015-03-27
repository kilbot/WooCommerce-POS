/**
 * TODO: merge sync/idb.js & sync/idbsync.js
 */

var Collection = require('./collection');
//var debug = require('debug')('idbCollection');
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
    return $.when.apply(this, merge);
  },

  /**
   *
   */
  mergeRecord: function(record){
    var self = this;
    return $.when(
      this.indexedDB.getByAttribute({ id: record.id })
    ).then(function(local){
        if(local[0]){
          record[self.keyPath] = local[0][self.keyPath];
        }
        return self.indexedDB.put(record);
      }).then(function(id){
        return self.indexedDB.get(id);
      }).then(function(model){
        self.add(model, {merge: true});
      });
  }

});