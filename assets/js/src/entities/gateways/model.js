var Model = require('lib/config/model');

module.exports = Model.extend({
  idAttribute: 'method_id',

  defaults: {
    active: false
  }
});