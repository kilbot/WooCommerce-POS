var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');

module.exports = Model.extend({

  type: 'fee',

  defaults: function(){
    return {
      title   : polyglot.t('titles.fee'),
      taxable : true
    };
  },

  /**
   * Return total and total_tax for subtotal and subtotal_tax, respectively
   * - a little confusing, but makes cart.sum('subtotal') easier
   */
  get: function( attr ){
    if( attr === 'subtotal' ){
      attr = 'total';
    }
    if( attr === 'subtotal_tax' ){
      attr = 'total_tax';
    }
    return Model.prototype.get.call(this, attr);
  }

});