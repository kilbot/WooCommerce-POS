var bb = require('backbone');
var sync = require('lib/config/sync');

module.exports = bb.Model.extend({
  sync: sync
});