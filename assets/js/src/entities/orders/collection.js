var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');

module.exports = DualCollection.extend({
  model: Model,
  name: 'orders',

  comparator: function( model ){
    if( model.get('id') === undefined ) { return 0; }
    return 1;
  },

  getActiveOrder: function(){
    if(this.active){
      return this.active;
    }
    return this.add({});
  }

});