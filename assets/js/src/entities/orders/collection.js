var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');

module.exports = DualCollection.extend({

  model: Model,

  name: 'orders',

  _syncDelayed: false

});