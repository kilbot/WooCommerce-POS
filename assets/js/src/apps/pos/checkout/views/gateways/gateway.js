var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
//var $ = require('jquery');

module.exports = ItemView.extend({
  tagName: 'h5',
  template: hbs.compile('' +
    '{{title}}' +
    '{{#if icon}}<img src="{{icon}}">{{/if}}'
  ),

  events: {
    'click': 'makeActive'
  },

  makeActive: function(){
    this.model.set({
      active: true
    });
  }
});