var Collection = require('lib/config/collection');
var Model = require('./model');

module.exports = Collection.extend({
  model: Model,

  initialize: function() {
    this._isNew = false;
    this.on( 'change:active', this.onChangeActive );
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