var FilterCollection = require('lib/config/filtered-collection');
var Model = require('./model');
var _ = require('lodash');

module.exports = FilterCollection.extend({

  model: Model,

  superset: true,

  initialize: function(models, options){
    options = options || {};
    this.parent = options.parent;
  },

  /**
   * Returns an array of options for the variation collection
   * - caches on first run
   */
  getVariationOptions: function(){
    if( !this._variationOptions ) {

      this._variationOptions = _.chain( this.pluck('attributes') )
        .reduce(function(result, attrs){
          _.each(attrs, function(attr){
            result[attr.name] = result[attr.name] || [];
            result[attr.name] = result[attr.name].concat(attr.option);
          });
          return result;
        }, {})
        .map(function(options, name){
          return {
            'name': name,
            'options': _.uniq( options )
          };
        })
        .value();
    }

    return this._variationOptions;
  },

  /**
   * same as _.compact, except allows 0
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

  /**
   *
   */
  range: function(attr){
    var attrs = this.compact( this.pluck(attr) ), min = 0, max = 0;
    if( !_.isEmpty(attrs) ) {
      min = parseFloat( _(attrs).min() );
      max = parseFloat( _(attrs).max() );
    }
    return _.uniq([min, max]);
  },

  setVariantFilter: function(name, option){
    var query = [
      {type: 'prefix', prefix: 'attributes.name', query: name },
      {type: 'prefix', prefix: 'attributes.option', query: option },
    ];

    this.setFilter(name, query);
  }

});