var Model = require('lib/config/model');

module.exports = Model.extend({
  parse: function (resp) {
    return resp.customer ? resp.customer : resp ;
  }
});