var DualCollection = require('lib/config/dual-collection');
var _ = require('lodash');

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

module.exports = DualCollection.extend({

  /**
   * Init model based on product type
   */
  model: function(attributes, options){
    attributes = attributes || {};
    var Subclass = subclasses[attributes.type] || subclasses['simple'];
    return new Subclass(attributes, options);
  },

  name: 'products',

  defaultFilterOptions: {
    fields : ['title'],
    order  : 'ASC',
    orderby: 'title'
  },

  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['title'],

  /**
   * Special cases for product model filter
   */
  matchMaker: function(json, query, options){
    var matchMaker = this.default.matchMaker;
    if(_.isArray(query)){
      replaceCat(query);
    }

    // parent match
    var parentMatch = matchMaker.call(this, json, query, options);
    if(parentMatch){
      return true;
    }

    // any variation match
    if(!_.isEmpty(json.variations)){
      var variationMatch = _.some(json.variations, function(variation){
        return matchMaker(variation, query, options);
      });
      if(variationMatch){
        return true;
      }
    }
  }

});