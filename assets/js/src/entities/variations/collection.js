var Collection = require('lib/config/collection');
var Model = require('./model');
//var ? = require('lodash');
var Radio = require('backbone.radio');

module.exports = Collection.extend({
  model: Model,

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'products';
  },

  initialize: function() {
    this._isNew = false;
  }

});