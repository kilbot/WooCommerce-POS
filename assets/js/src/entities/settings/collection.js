var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Collection.extend({
  model: Model,

  url: function(){
    return this.wc_api + 'pos/settings';
  },

  constructor: function(models, options) {
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings'
    });

    options = _.extend( {}, options, { parse: true } );

    return Collection.prototype.constructor.call(this, settings, options);
  }

});