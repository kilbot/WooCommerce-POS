var Model = require('lib/config/model');
var Collection = require('lib/config/collection');

var Tab = Model.extend({
  defaults: {
    id: '',
    label: 'Tab',
    active: false,
    fixed: true
  }
});

var Tabs = Collection.extend({
  model: Tab,

  initialize: function() {
    this.on( 'remove', this.onRemove );
  },

  onRemove: function() {
    var activeTabs = this.where({'active':true});
    if( activeTabs.length === 0 ) {
      this.at(0).set({active:true});
    }
  },

  setActive: function(id){
    this.each( function(tab) {
      tab.set({active: ( id === tab.id ) });
    });
  }

});

module.exports = Tabs;