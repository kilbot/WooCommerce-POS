var Model = require('lib/config/model');

module.exports = Model.extend({
  name: 'coupon',
  extends: ['dual', 'filtered']
});