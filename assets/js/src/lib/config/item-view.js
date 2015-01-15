var Backbone = require('backbone');
var POS = require('lib/utilities/global');

var ItemView = Backbone.Marionette.ItemView;

module.exports = ItemView;
POS.attach('ItemView', ItemView);