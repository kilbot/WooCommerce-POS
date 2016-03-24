var DualModel = require('lib/config/dual-model');
var App = require('lib/config/application');

var CustomersModel = DualModel.extend({
  name: 'customer'
});

module.exports = CustomersModel;
App.prototype.set('Entities.Customers.Model', CustomersModel);