var app = require('./application');
var Model = require('./model');
var DeepModel = require('backbone-deep-model/src/index');

module.exports = app.prototype.DeepModel = Model.extend(DeepModel);