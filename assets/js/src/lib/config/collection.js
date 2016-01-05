var bb = require('backbone');
var app = require('./application');
var sync = require('lib/config/sync');

module.exports = app.prototype.Collection = bb.Collection.extend({
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

  parse: function (resp){
    return resp && resp[this.name] ? resp[this.name] : resp ;
  },

  sync: sync

});