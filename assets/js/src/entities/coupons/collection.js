var Collection = require('lib/config/collection');
var Model = require('./model');

module.exports = Collection.extend({
  model: Model
});