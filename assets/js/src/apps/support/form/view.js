var ItemView = require('lib/config/item-view');
var Backbone = require('backbone');

module.exports = ItemView.extend({
  template: '#tmpl-support-form',
  tagName: 'form',
  attributes: {
    'class'         : 'module support-module'
  },

  events: {
    'submit': 'send'
  },

  send: function(e) {
    e.preventDefault();
    var data = Backbone.Syphon.serialize( this );
    this.trigger( 'send:email', data );
  }
});