var Collection = require('lib/config/collection');
var Model = require('./model');
var $ = require('jquery');

module.exports = Collection.extend({
  model: Model,
  initialize: function() {
    this.on( 'change:active', this.onChangeActive );
  },

  fetch: function(){
    var self = this;
    $('.tmpl-checkout-gateways').each(function(){
      var method = $(this).data('gateway');
      self.add({ id: method });
    });

    this._isNew = false;
  },

  onChangeActive: function(model, active) {
    if(!active){ return; }
    this.each( function(tab) {
      if( model.id !== tab.id ) {
        tab.set({ active: false });
      }
    });
  }
});