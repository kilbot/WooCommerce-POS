var Model = require('lib/config/model');

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
  }

});