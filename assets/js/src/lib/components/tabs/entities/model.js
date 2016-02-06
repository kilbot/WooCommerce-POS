var Model = require('lib/config/model');

var TabModel = Model.extend({
  defaults: {
    id: '',
    label: 'Tab', // space
    active: false
  }
});

module.exports = TabModel;