var bb = require('backbone');
var POS = require('lib/utilities/global');
var debug = require('debug')('collection');

module.exports = POS.Collection = bb.Collection.extend({
  constructor: function() {
    bb.Collection.apply(this, arguments);
    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  isNew: function() {
    return this._isNew;
  },

  // TODO: move indexedDB logic to Backbone.idbSync
  fetch: function(options){
    var self = this;

    if(!this.indexedDB){
      debug('fetching', this);
      return bb.Collection.prototype.fetch.call(this, options);
    }

    return $.when(this._isReady).then(function() {
      debug('fetching: ' + self.name);
      return bb.Collection.prototype.fetch.call(self, options);
    });
  }

});