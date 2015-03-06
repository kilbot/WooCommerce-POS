var Collection = require('lib/config/collection');
var Model = require('./model');
var _ = require('lodash');

module.exports = Collection.extend({
  model: Model,

  initialize: function() {
    this._isNew = false;
  },

  getVariations: function(parent){
    var variations = [];
    _.each(parent.get('variations'), function(variation) {
      variation.type  = 'variation';
      variation.title = parent.get('title');
      variations.push(variation);
    }, this);
    this.reset(variations);
  }

});