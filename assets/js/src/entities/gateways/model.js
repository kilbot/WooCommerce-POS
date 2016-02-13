var Model = require('lib/config/model');
var _ = require('lodash');

module.exports = Model.extend({

  idAttribute: 'method_id',

  defaults: {
    active: false
  },

  constructor: function( attributes, options ){
    attributes = attributes || {};
    this.payment_fields = attributes.payment_fields;
    this.params = attributes.params;
    this.icons = attributes.icons;

    attributes = _.pick(
      attributes,
      ['active', 'method_id', 'method_title']
    );

    Model.call( this, attributes, options );
  },

  getPaymentFields: function(){
    return this.payment_fields;
  },

  getParams: function(){
    return this.params;
  },

  getIcons: function(){
    return this.icons;
  }

});