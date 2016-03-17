var DualCollection = require('lib/config/dual-collection');

var subclasses = {
  simple   : require('./models/simple'),
  variable : require('./models/variable')
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

  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['title'],

});