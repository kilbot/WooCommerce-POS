/**
 * TODO: merge sync/idb.js & sync/idbsync.js?
 */

var Collection = require('./collection');
//var debug = require('debug')('idbCollection');
var app = require('./application');
var IndexedDB = require('./idb/src/idb');
var Radio = require('backbone.radio');

module.exports = app.prototype.IndexedDBCollection = Collection.extend({
  name          : 'store',
  storePrefix   : 'wc_pos_',
  dbVersion     : 4006,
  keyPath       : 'local_id',
  autoIncrement : true,
  indexes       : [
    {name: 'local_id', keyPath: 'local_id', unique: true},
    {name: 'id', keyPath: 'id', unique: true}
  ],

  constructor: function() {
    Collection.apply(this, arguments);

    var options = {
      storeName     : this.name,
      storePrefix   : this.storePrefix,
      dbVersion     : this.dbVersion,
      keyPath       : this.keyPath,
      autoIncrement : this.autoIncrement,
      indexes       : this.indexes,
      defaultErrorHandler : function(error){
        Radio.trigger('global', 'error', {
          status: error.target.error.name,
          message: error.target.error.message
        });
      }
    };

    this.db = new IndexedDB(options, this);
    this.versionCheck();
    this.db.open()
      // error opening db
      .fail(function(error){
        Radio.trigger('global', 'error', {
          status    : 'indexedDB error',
          message   : error
        });
      });
  },

  merge: function(models){
    var self = this;
    return this.db.merge(models)
      .then(function(){
        var models = Array.prototype.slice.apply(arguments);
        return self.add(models, {merge: true});
      });
  },

  /**
   * Clears the IDB storage and resets the collection
   */
  clear: function(){
    if(!this.db){
      return;
    }

    var self = this;
    return this.db.open()
      .then(function(){
        self.reset();
        return self.db.clear();
      });
  },

  /**
   * Each website will have a unique idbVersion number
   * the version number is incremented on plugin update and some user actions
   * this version check will compare the version numbers
   * idb is flushed on version change
   */
  versionCheck: function(){
    var name = this.name;

    var newVersion = parseInt( Radio.request('entities', 'get', {
      type: 'option',
      name: 'idbVersion'
    }), 10 ) || 0;
    var oldVersion = parseInt( Radio.request('entities', 'get', {
      type: 'localStorage',
      name: name + '_idbVersion'
    }), 10 ) || 0;

    if( newVersion !== oldVersion ){
      this.clear().then(function(){
        Radio.request('entities', 'set', {
          type : 'localStorage',
          name : name + '_idbVersion',
          data : newVersion
        });
      });
    }
  }

});