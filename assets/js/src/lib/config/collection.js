var bb = require('backbone');
var app = require('./application');

module.exports = app.prototype.Collection = bb.Collection.extend({

  constructor: function() {
    bb.Collection.apply(this, arguments);
    this.resetNew();
  },

  resetNew: function(){
    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  isNew: function() {
    return this._isNew;
  }

});