var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Collection.extend({
  model: Model,

  constructor: function(models, options) {
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings',
      root: true
    });
    models = _.map(settings, function(setting){
      _.set(setting, ['data', 'id'], setting.id);
      return setting.data;
    });
    return Collection.prototype.constructor.call(this, models, options);
  }
});