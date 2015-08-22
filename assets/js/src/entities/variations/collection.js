var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');
var _ = require('lodash');

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
  },

  /**
   * same as _.compact
   * except allows 0
   */
  /* jshint -W074 */
  compact: function(array) {
    var index = -1,
      length = array ? array.length : 0,
      resIndex = -1,
      result = [];

    while (++index < length) {
      var value = array[index];
      if (value === 0 || value) {
        result[++resIndex] = value;
      }
    }
    return result;
  },
  /* jshint +W074 */

  range: function(attr){
    var attrs = this.compact( this.pluck(attr)), min = 0, max = 0;
    if( !_.isEmpty(attrs) ) {
      min = _(attrs).min();
      max = _(attrs).max();
    }
    return _.uniq([min, max]);
  }

});