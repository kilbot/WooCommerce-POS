var bb = require('backbone');
var POS = require('lib/utilities/global');
//var Radio = require('backbone.radio');

module.exports = POS.Collection = bb.Collection.extend({
  constructor: function() {
    bb.Collection.apply(this, arguments);
    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });

    //this.on('error', function(entity, resp){
    //  Radio.trigger('global', 'error', {
    //    jqXHR   : resp
    //  });
    //});
  },

  isNew: function() {
    return this._isNew;
  },

  parse: function (resp){
    return resp && resp[this.name] ? resp[this.name] : resp ;
  },

  sync: function(){
    return bb.sync.apply(this, arguments);
  }

});