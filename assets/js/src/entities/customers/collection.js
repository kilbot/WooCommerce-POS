var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');

module.exports = Collection.extend({
  model: Model,
  name: 'customers',

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'customers';
  },

  initialize: function(){
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    if(settings){
      this._guest = settings.guest;
      this._default = settings['default'] || settings.guest;
    }
  }
});