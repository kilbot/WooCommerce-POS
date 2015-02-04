var ItemView = require('lib/config/item-view');
var Buttons = require('lib/components/buttons/behavior');
var hbs = require('handlebars');
var Radio = require('backbone').Radio;

module.exports = ItemView.extend({
  template: hbs.compile('' +
    '<p class="message"></p>' +
    '{{#each buttons}}' +
    '<button class="btn {{this.className}}" data-action="{{this.action}}">{{this.label}}</button>' +
    '{{/each}}'
  ),

  initialize: function(options){
    options = options || {};
    if(options === false){
      console.log('hide footer');
    }

    _.defaults(options, {
      buttons: [{
        action: 'save',
        className: 'btn-primary'
      }]
    });

    this.buttons = options.buttons;
  },

  templateHelpers: function(){
    var labels = Radio.request('entities', 'get', {
      type: 'option',
      name: 'buttons'
    }) || {};

    _.each(this.buttons, function(button){
      button.label = labels[button.action] ? labels[button.action] : 'Save';
    });

    return {
      buttons: this.buttons
    };
  },

  behaviors: {
    Buttons: {
      behaviorClass: Buttons,
      //modal: true
    }
  }
});

