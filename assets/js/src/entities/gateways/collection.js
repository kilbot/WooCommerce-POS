var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Collection.extend({
  model: Model,

  constructor: function(models, options) {
    models = Radio.request('entities', 'get', {
      type: 'option',
      name: 'gateways'
    }) || [];
    if( models.length > 0 && _(models).pluck('active').compact().isEmpty() ){
      models[0].active = true;
    }
    return Collection.prototype.constructor.call(this, models, options);
  },

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