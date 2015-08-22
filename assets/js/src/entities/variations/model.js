//var Model = require('lib/config/model');
var Model = require('lib/config/deep-model');

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

  initialize: function(attributes, options){
    options = options || {};
    this.parent = options.parent;
    this.set({ title: options.parent.get('title') });
  },

  // copy variation to parent
  save: function(attributes, options){
    var self = this;
    return Model.prototype.save.call(this, attributes, options)
      .then(function(){
        self.parent.set({ variations: self.collection.toJSON() });
        self.parent.merge();
      });
  }

});