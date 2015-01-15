var DualModel = require('lib/config/dual-model');

module.exports = DualModel.extend({
  name: 'order',

  defaults: {
    note: ''
  },

  // Convenience method to sum attributes
  sum: function(array){
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += this.get(array[i]);
    }
    return sum;
  }
});
