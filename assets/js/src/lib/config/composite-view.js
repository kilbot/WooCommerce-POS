var Mn = require('backbone.marionette');
var app = require('./application');

module.exports = app.prototype.CollectionView = Mn.CompositeView;