var app = require('./application');
var Model = require('./model');
var DeepModel = require('./deep-model/src/index');

module.exports = app.prototype.DeepModel = Model.extend(DeepModel);