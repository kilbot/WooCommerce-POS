/**
 * TODO: merge sync/idb.js & sync/idbsync.js?
 */

var Collection = require('./collection');
//var debug = require('debug')('idbCollection');
var POS = require('lib/utilities/global');
var IndexedDB = require('./idb/src/idb');

module.exports = POS.IndexedDBCollection = Collection.extend({
  name          : 'store',
  storePrefix   : 'wc_pos_',
  dbVersion     : 1,
  keyPath       : 'local_id',
  autoIncrement : true,
  indexes       : [
    {name: 'local_id', keyPath: 'local_id', unique: true},
    {name: 'id', keyPath: 'id', unique: true},
    {name: 'status', keyPath: 'status', unique: false}
  ],

  constructor: function() {
    Collection.apply(this, arguments);

    var options = {
      storeName     : this.name,
      storePrefix   : this.storePrefix,
      dbVersion     : this.dbVersion,
      keyPath       : this.keyPath,
      autoIncrement : this.autoIncrement,
      indexes       : this.indexes
    };

    this.db = new IndexedDB(options, this);
    this.db.open();
  },

  merge: function(models){
    var self = this;
    return this.db.merge(models)
      .then(function(){
        var models = Array.prototype.slice.apply(arguments);
        return self.add(models, {merge: true});
      });
  }

});