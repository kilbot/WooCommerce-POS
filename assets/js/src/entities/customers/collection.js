var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var Radio = require('backbone.radio');

module.exports = DualCollection.extend({
  model: Model,
  name: 'customers',
  indexes: [
    {name: 'local_id', keyPath: 'local_id', unique: true},
    {name: 'id', keyPath: 'id', unique: true},
    {name: 'status', keyPath: 'status', unique: false},
    {name: 'email', keyPath: 'email', unique: true},
    {name: 'username', keyPath: 'username', unique: true}
  ],

  initialize: function(){
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    if(settings){
      this._guest = settings.guest;
      this._default = settings['default'] || settings.guest;
    }
  },

  getGuestCustomer: function(){
    return this._guest;
  },

  getDefaultCustomer: function(){
    return this._default;
  }

});