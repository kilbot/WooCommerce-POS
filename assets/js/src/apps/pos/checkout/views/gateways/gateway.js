var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var $ = require('jquery');

module.exports = ItemView.extend({
  tagName: 'h5',
  template: hbs.compile('' +
    '<input type="radio">' +
    '{{title}}' +
    '{{#if icon}}<img src="{{icon}}">{{/if}}'
  ),

  initialize: function() {
  },

  templateHelpers: function(){
    var tmpl = $('script[data-gateway="' + this.model.id + '"]');
    var data = {
      title: tmpl.data('title'),
      icon: tmpl.data('icon')
    };
    return data;
  },

  modelEvents: {
    'change:active': 'onChangeActive'
  },

  events: {
    'click': 'makeActive'
  },

  makeActive: function(){
    this.model.set({
      active: true
    });
  },

  onChangeActive: function(model, active){
    this.$('input[type="radio"]').prop('checked', active);
  }
});