var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');

module.exports = Model.extend({

  type: 'shipping',

  defaults: function(){
    return {
      method_title  : polyglot.t('titles.shipping'),
      taxable       : true,
      method_id     : ''
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