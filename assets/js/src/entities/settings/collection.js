var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone').Radio;

module.exports = Collection.extend({
  model: Model
});