var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');

/**
 * @todo: abstract a tabbed collection
 */
module.exports = Collection.extend({
  model: Model,

  /**
   * Construct with gateway settings, mix in saved attributes
   */
  constructor: function( models, options ) {
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'gateways'
    }) || [];

    Collection.prototype.constructor.call(this, settings, options);

    this.on( 'change:active', this.onChangeActive );

    if( models ){
      this.set( models, { remove: false } );
    }
  },

  onChangeActive: function(model, active) {
    if(!active){ return; }
    this.each( function(tab) {
      if( model.id !== tab.id ) {
        tab.set({ active: false });
      }
    });
  },

  getActiveGateway: function(){
    return this.findWhere({ active: true });
  },

  getPaymentDetails: function(){
    var activeGateway = this.getActiveGateway();
    if( activeGateway ){
      return activeGateway.toJSON();
    }
  }

});