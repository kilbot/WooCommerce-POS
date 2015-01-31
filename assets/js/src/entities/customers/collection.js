var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone').Radio;

module.exports = Collection.extend({
  model: Model,

  initialize: function(){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
    this.url = ajaxurl + '?action=wc_pos_json_search_customers';
  }
});