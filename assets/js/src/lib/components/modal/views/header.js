var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Radio = require('backbone.radio');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

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

    defaults = {
      title: polyglot.t('messages.loading'),
      close: polyglot.t('buttons.close')
    };

    this.data = _.defaults(options, defaults);
  },

  templateHelpers: function(){
    return this.data;
  },

  onUpdate: function(options){
    _.extend(this.data, options);
    this.render();
  }
});