var bb = require('backbone');
var POS = require('lib/utilities/global');

module.exports = POS.DualModel = bb.DualModel.extend({
  idAttribute: 'local_id',
  remoteIdAttribute: 'id',
  fields: ['title'],
  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  }
});