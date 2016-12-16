var Collection = require('lib/config/collection');
var Model = require('./model');

module.exports = Collection.extend({
  model: Model,
  name: 'coupons',
  extends: ['dual', 'filtered'],
  initialState: {
    filter: {
      order: 'ASC',
      orderby: 'code',
      limit: 10,
      qFields: [
        'code'
      ]
    }
  },
});