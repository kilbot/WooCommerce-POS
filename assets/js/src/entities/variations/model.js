var Model = require('lib/config/model');
var _ = require('lodash');

module.exports = Model.extend({
  name: 'product',
  defaults: {
    type: 'variation'
  },

  initialize: function(attributes, options){
    options = options || {};
    this.parent = options.parent;
    this.set({ title: options.parent.get('title') });
  },

  save: function(attributes, options){
    var self = this;
    return Model.prototype.save.call(this, attributes, options)
      .then(function(){
        self.parent.set({ variations: self.collection.toJSON() });
        self.parent.merge();
      });
  },

  // the REST API gives string values for some attributes
  // this can cause confusion, so parse to float
  parse: function(resp){
    resp = resp.product || resp;
    _.each(['price', 'regular_price', 'sale_price'], function(attr){
      if( _.isString(resp[attr]) ){
        resp[attr] = parseFloat(resp[attr]);
      }
    });
    return resp;
  }

});