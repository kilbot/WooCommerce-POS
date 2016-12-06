var Model = require('lib/config/model');
var App = require('lib/config/application');

var CustomersModel = Model.extend({
  name: 'customer',
  extends: ['dual', 'filtered']
});

module.exports = CustomersModel;
App.prototype.set('Entities.Customers.Model', CustomersModel);