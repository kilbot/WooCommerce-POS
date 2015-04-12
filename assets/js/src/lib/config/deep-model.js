var POS = require('lib/utilities/global');
var Model = require('./model');
var DeepModel = require('./deep-model/src/index');

module.exports = POS.DeepModel = Model.extend(DeepModel);