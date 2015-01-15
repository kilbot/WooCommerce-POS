var bb = require('backbone');
var POS = require('lib/utilities/global');

var CollectionView = bb.Marionette.CollectionView;

module.exports = CollectionView;
POS.attach('CollectionView', CollectionView);