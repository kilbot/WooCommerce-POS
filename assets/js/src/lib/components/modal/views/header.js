var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Radio = require('backbone').Radio;

module.exports = ItemView.extend({
  template: hbs.compile('' +
    '<h1>{{{title}}}</h1>' +
    '<i class="icon icon-times" ' +
    'data-action="close" ' +
    'title="{{close}}">' +
    '</i>'
  ),

  initialize: function(options){
    var messages, buttons, defaults;
    if(options === false){
      console.log('hide header');
    }

    messages = Radio.request('entities', 'get', {
      type: 'option',
      name: 'messages'
    }) || {};

    buttons = Radio.request('entities', 'get', {
      type: 'option',
      name: 'buttons'
    }) || {};

    defaults = {
      title: messages.loading,
      close: buttons.close
    }

    this.data = _.defaults(options, defaults);
  },

  templateHelpers: function(){
    return this.data;
  }
});