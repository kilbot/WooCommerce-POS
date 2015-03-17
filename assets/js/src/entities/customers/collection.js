var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');

module.exports = Collection.extend({
  model: Model,

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'customers';
  },

  initialize: function(){

  },

  parse: function (resp) {
    return resp.customers ? resp.customers : resp ;
  }
});