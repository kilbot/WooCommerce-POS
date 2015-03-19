var Model = require('lib/config/model');

var TabModel = Model.extend({
  defaults: {
    id: '',
    label: 'Tab',
    active: false,
    fixed: true
  }
});

module.exports = TabModel;