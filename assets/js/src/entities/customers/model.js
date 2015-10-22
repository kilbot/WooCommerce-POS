var DualModel = require('lib/config/dual-model');
var App = require('lib/config/application');

var CustomersModel = DualModel.extend({
  name: 'customer',
  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['email', 'username', 'first_name', 'last_name']
});

module.exports = CustomersModel;
App.prototype.set('Entities.Customers.Model', CustomersModel);