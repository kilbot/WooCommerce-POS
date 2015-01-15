var Model = require('lib/config/model');
var Collection = require('lib/config/collection');
var _ = require('lodash');

var Tab = Model.extend({
  defaults: {
    label: '&nbsp;',
    value: '',
    active: false,
    fixed: true
  },
  idAttribute: 'value'
});

var Tabs = Collection.extend({
  model: Tab,
  initialize: function() {
    this.on( 'remove', this.onRemove );
    this.on( 'change:active', this.onChangeActive );
  },

  onRemove: function() {
    var activeTabs = _.compact( this.pluck('active') );
    if( _.isEmpty( activeTabs ) ) {
      this.first().set({ active: true });
    }
  },

  onChangeActive: function(model) {
    this.each( function(tab) {
      if( model.id !== tab.id ) {
        tab.set( { active: false }, { silent: true } );
      }
    });
  }

});

module.exports = Tabs;