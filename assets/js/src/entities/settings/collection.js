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
    return wc_api + 'pos/settings';
  },

  constructor: function(models, options) {
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings'
    });

    // tack on tabsArray, @todo find a better way
    this.tabsArray = [];

    models = _.map(settings, function(setting){
      var attrs = setting.data || {};
      attrs.id = setting.id;
      this.tabsArray.push({ id: setting.id, label: setting.label });
      return attrs;
    }, this);

    return Collection.prototype.constructor.call(this, models, options);
  }

});