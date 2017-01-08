var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Model.extend({

  type: 'shipping',

  defaults: function(){
    var shipping = Radio.request('entities', 'get', {
      type: 'option',
      name: 'shipping'
    });
    return {
      id            : null,
      method_title  : _.get( shipping, 'name', polyglot.t('titles.shipping') ),
      method_id     : _.get( shipping, 'method', '' ),
      taxable       : _.get( shipping, 'taxable', true ),
      tax_class     : _.get( shipping, 'tax_class', '' ),
      price         : _.get( shipping, 'price', 0 )
    };
  },

  initialize: function(attributes, options){
    if(attributes && !attributes.price){
      this.set('price', _.get(attributes, 'total')); // convert order fee_line to price
    }
    Model.prototype.initialize.call( this, attributes, options );
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