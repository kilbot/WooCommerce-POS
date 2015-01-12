var bb = require('backbone');
var $ = require('jquery');
var POS = require('lib/utilities/global');

module.exports = POS.DualCollection = bb.DualCollection.extend({
  constructor: function() {
    bb.DualCollection.apply(this, arguments);

    this._isReady = $.Deferred();
    this.once('idb:ready', function() {
      this._isReady.resolve();
    });

    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  isNew: function() {
    return this._isNew;
  },

  fetch: function(options){
    var self = this;
    return $.when( this._isReady).then(function() {
      return bb.DualCollection.prototype.fetch.call(self, options);
    });
  }
});