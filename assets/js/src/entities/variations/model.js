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

  parse: function(data, options){
    data = Model.prototype.parse.call(this, data, options);
// options = options || {};
// var parentAttrs = options.parentAttrs || {};
// if( _.isEmpty(parentAttrs) && this.collection && this.collection.parent ){
//   parentAttrs = this.collection.parent.toJSON();
// }
//
// // special case, empty option
// _(data.attributes).chain()
//   .filter({option: ''})
//   .each(function(empty){
//     empty.option = _(parentAttrs.attributes).chain()
//       .find({ name: empty.name, variation: true })
//       .get(['options']).value();
//   })
//   .value();

    return data;
  }

});