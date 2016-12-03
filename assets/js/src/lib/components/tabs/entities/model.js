var Model = require('lib/config/model');

var TabModel = Model.extend({
  defaults: {
    label: 'Tab' // space
  }
});

module.exports = TabModel;