var ItemView = require('lib/config/item-view');
var Handlebars = require('handlebars');
var $ = require('jquery');

module.exports = ItemView.extend({
  tagName: 'section',
  attributes: {
    'class'         : 'module status-module',
    'data-title'    : 'System Status'
  },

  initialize: function(options) {
    this.template = Handlebars.compile( $('#tmpl-pos-status').html() );
    this.results = options;
  },

  serializeData: function() {
    return this.results.responseJSON;
  }
});