var bb = require('backbone');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');

// todo: why isNew used here? remove this ..
// isNew prevents model destroy
module.exports = POS.Model = bb.Model.extend({
  constructor: function() {
    bb.Model.apply(this, arguments);

    this.on('error', function(jqXHR, textStatus, errorThrown){
      Radio.trigger('global', 'error', {
        jqXHR   : jqXHR,
        status  : textStatus,
        message : errorThrown
      });
    });
  },

  parse: function (resp){
    return resp && resp[this.name] ? resp[this.name] : resp ;
  }
});