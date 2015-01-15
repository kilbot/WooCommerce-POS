var bb = require('backbone');
var POS = require('lib/utilities/global');

var Collection = bb.Collection.extend({
  constructor: function() {
    Backbone.Collection.apply(this, arguments);
    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  isNew: function() {
    return this._isNew;
  }
});

module.exports = Collection;
POS.attach('Collection', Collection);