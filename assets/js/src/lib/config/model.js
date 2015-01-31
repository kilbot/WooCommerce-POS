var bb = require('backbone');
var POS = require('lib/utilities/global');

module.exports = POS.Model = bb.Model.extend({
  constructor: function() {
    bb.Model.apply(this, arguments);
    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  isNew: function() {
    return this._isNew;
  }
});