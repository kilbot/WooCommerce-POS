var bb = require('backbone');
var Collection = require('./collection');
var debug = require('debug')('idbCollection');
var POS = require('lib/utilities/global');
var $ = require('jquery');
var IndexedDB = require('./sync/idb');

module.exports = POS.IndexedDBCollection = Collection.extend({

  constructor: function() {
    Collection.apply(this, arguments);

    this._isReady = $.Deferred();

    this.once('idb:ready', function(){
      this._isReady.resolve(this);
    }, this);

    this.indexedDB = new IndexedDB(this);
  },

  fetch: function(options){
    var self = this;
    return $.when(this._isReady).then(function() {
      debug('fetching ' + self.name);
      return bb.Collection.prototype.fetch.call(self, options);
    });
  }

});