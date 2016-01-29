var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Model.extend({

  type: 'fee',

  defaults: function(){
    var fee = Radio.request('entities', 'get', {
      type: 'option',
      name: 'fee'
    });
    return {
      title         : _.get( fee, 'name', polyglot.t('titles.fee') ),
      taxable       : _.get( fee, 'taxable', true ),
      tax_class     : _.get( fee, 'tax_class', '' ),
      price         : _.get( fee, 'price', 0 )
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