//var Model = require('lib/config/model');
var Model = require('lib/config/deep-model');
var _ = require('lodash');
var Radio = require('backbone.radio');

module.exports = Model.extend({
  name: 'product',
  defaults: {
    type: 'variation'
  },

  // data types
  schema: {
    price         : 'number',
    regular_price : 'number',
    sale_price    : 'number',
    stock_quantity: 'number'
  },

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    if(wc_api.indexOf('wp-json') !== -1) {
      var id = this.get('id');
      var parent_id = this.parent.get('id');
      if(id && parent_id) {
        return wc_api + 'products/' + parent_id + '/variations/' + id;
      }
    }
    return wc_api + 'products/' + this.id;
  },

  constructor: function(attributes, options){
    options = _.extend({parse: true}, options); // parse by default
    Model.call(this, attributes, options);
  },

  initialize: function(attributes, options){
    options = options || {};
    this.parent = options.parent;
    this.set({ name: options.parent.get('name') });
  },

  // copy variation to parent
  save: function(attributes, options){
    var self = this;
    return Model.prototype.save.call(this, attributes, options)
      .then(function(){
        self.parent.set({ variations: self.collection.toJSON() });
        self.parent.merge();
      });
  },

  /**
   *
   */
  getVariationAttributes: function(){
    var result = [];
    var attributes = this.get('attributes');

    _.each(this.parent.productVariations(), function(attribute){
      // pluck attribute on id and merge
      var attr = _.findWhere(attributes, { id: attribute.id }) ||
        _.findWhere(attributes, { name: attribute.name }); // legacy api

      if( attr ) {
        result.push( _.merge(attr, attribute) );
      } else {
        result.push( attribute );
      }
    });

    // sort
    return _.sortBy( result, 'position' );
  }

});