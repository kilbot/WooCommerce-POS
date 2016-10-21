var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');

/**
 * Integration registry
 */
var integrations = {
  'pos_cash': require('./integrations/pos_cash'),
  'pos_card': require('./integrations/pos_card')
};

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
    if( ! active ){ return; }

    this.each( function( gateway ) {
      if( model.id !== gateway.id ) {
        gateway.set({ active: false });
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
  },

  addIntegration: function(id, obj){
    integrations[id] = obj;
  },

  getIntegration: function(id){
    if(integrations[id]){
      return integrations[id];
    }
  }

});