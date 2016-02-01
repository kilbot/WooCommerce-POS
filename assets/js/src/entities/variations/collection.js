var Collection = require('lib/config/collection');
var Model = require('./model');
var _ = require('lodash');

module.exports = Collection.extend({

  model: Model,

  /**
   * Returns an array of options for the variation collection
   * - caches on first run
   */
  getVariationOptions: function(){
    if( this._variationOptions ) {
      return this._variationOptions;
    }

    // pluck all options, eg:
    // { Color: ['Black', 'Blue'], Size: ['Small', 'Large'] }
    var result = this.pluck('attributes')
      .reduce(function(result, attrs){
        _.each(attrs, function(attr){
          if(result[attr.name]){
            return result[attr.name].push(attr.option);
          }
          result[attr.name] = [attr.option];
        });
        return result;
      }, {});

    // map options with consistent keys
    // { name: 'Color', options: ['Black', 'Blue'] },
    // { name: 'Size', options: ['Small', 'Large'] }
    this._variationOptions = _.map(result, function(options, name){
      return {
        'name': name,
        'options': _.uniq( options )
      };
    });

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
  }

});