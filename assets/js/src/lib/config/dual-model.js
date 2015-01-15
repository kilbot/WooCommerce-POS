var Backbone = require('backbone');
var POS = require('lib/utilities/global');

var DualModel = Backbone.DualModel.extend({
  idAttribute: 'local_id',
  remoteIdAttribute: 'id',
  fields: ['title'],
  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  }
});

module.exports = DualModel;
POS.attach('DualModel', DualModel);