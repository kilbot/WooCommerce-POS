var Collection = require('lib/config/collection');
var _ = require('lodash');
var Radio = require('backbone.radio');

var subclasses = {
  simple   : require('./models/simple'),
  variable : require('./models/variable')
};

var replaceCat = function(query){
  _.each(query, function(q){
    if(_.has(q, 'queries')){
      return replaceCat(q.queries);
    }
    if(_.has(q, 'prefix') && q.prefix === 'cat'){
      q.prefix = 'categories';
    }
  });
};

module.exports = Collection.extend({

  /**
   * Init model based on product type
   */
  model: function(attributes, options){
    attributes = attributes || {};
    var Subclass = subclasses[attributes.type] || subclasses['simple'];
    return new Subclass(attributes, options);
  },

  /**
   * Overwrites Collection.modelId which expects this.model as an object, not a function
   */
  modelId: function(attrs) {
    // return attrs[this.model.prototype.idAttribute || 'id'];
    return attrs['local_id'];
  },

  name: 'products',

  extends: ['dual', 'filtered'],

  initialState: {
    filter: {
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title']
    }
  },

  /**
   * Special cases for product model filter
   * @todo: refactor matchMaker 'this' should be collection, not IDBAdapter
   * @todo: make FilteredCollection.matchMaker default
   */
  matchMaker: function(json, query, options){
    var barcode, matchMaker = this.default.matchMaker;
    if(_.isArray(query)){
      replaceCat(query);
      barcode = _.chain(query).findWhere({ prefix: 'barcode'}).get('query').value();
    }

    // parent match, not variable
    var parentMatch = matchMaker.call(this, json, query, options);
    if(parentMatch){
      if(barcode && _.get(json, 'barcode') === barcode && _.get(json, 'type') !== 'variable'){
        Radio.request('router', 'add:to:cart', json);
      }
      return true;
    }

    /**
     * variable match
     * - only searching variation barcode
     * - @todo write readme for product vs product_variation search
     */
    if(_.get(json, 'type') === 'variable' && barcode){
      var variations = _.reduce(_.get(json, 'variations'), function(result, variation){
        if(matchMaker(variation, query, options)){
          result.push(variation);
        }
        return result;
      }, []);
      if(variations.length > 0){
        if(variations.length === 1 && _.get(variations, [0, 'barcode']) === barcode){
          var variation = _.get(variations, 0);
          variation.title = _.get(json, 'title');
          Radio.request('router', 'add:to:cart', variation);
        }
        return true;
      }
    }
  }

});