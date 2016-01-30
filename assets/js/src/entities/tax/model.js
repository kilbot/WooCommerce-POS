var bb = require('backbone');
var _ = require('lodash');

module.exports = bb.Model.extend({

  idAttribute: 'rate_id',

  defaults: {
    total     : 0,
    subtotal  : 0,
    enabled   : true
  },

  getRate: function(){
    return parseFloat( this.get('rate') ) / 100;
  },

  // put rates into correct format
  parse: function( attributes ){
    if( attributes.hasOwnProperty('label') ){
      attributes = _.extend( {}, attributes, {
        title   : attributes.label,
        compound: attributes.compound === 'yes',
        shipping: attributes.shipping === 'yes'
      } );
      delete attributes.label;
    }
    return attributes;
  }

});