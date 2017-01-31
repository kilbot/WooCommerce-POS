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
  },

  /**
   *
   */
  onShow: function(view){
    var integration = this.collection.getIntegration(this.id);
    if(integration && typeof integration.onShow === 'function'){
      return integration.onShow.call(this, view);
    }
  },

  /**
   *
   */
  onDestroy: function(view){
    var integration = this.collection.getIntegration(this.id);
    if(integration && typeof integration.onDestroy === 'function'){
      return integration.onDestroy.call(this, view);
    }
  },

  /**
   *
   */
  onProcess: function(order){
    var integration = this.collection.getIntegration(this.id);
    if(integration && typeof integration.onProcess === 'function'){
      return integration.onProcess.call(this, order);
    }
  },

  /**
   *
   */
  onCardScan: function(data){
    var integration = this.collection.getIntegration(this.id);
    if(integration && typeof integration.onCardScan === 'function'){
      return integration.onCardScan.call(this, data);
    } else {
      // hack to allow view to pick up default cc form
      this.trigger('card:scan', data);
    }
  }

});