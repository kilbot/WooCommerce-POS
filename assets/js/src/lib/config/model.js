var bb = require('backbone');
var POS = require('lib/utilities/global');
//var Radio = require('backbone.radio');

module.exports = POS.Model = bb.Model.extend({
  constructor: function() {
    bb.Model.apply(this, arguments);
  },

  parse: function (resp){
    return resp && resp[this.name] ? resp[this.name] : resp ;
  }
});