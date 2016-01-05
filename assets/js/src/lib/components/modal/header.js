var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./header.hbs');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = ItemView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    _.defaults(options, {
      title: polyglot.t('messages.loading', { _ : 'Loading' }),
      close: polyglot.t('buttons.close', { _ : 'Close' })
    });
  },

  templateHelpers: function(){
    return this.options;
  },

  ui: {
    close: '[data-action="close"]',
    title: 'h4'
  },

  triggers: {
    'click @ui.close': 'action:close'
  },

  // helper method to update title
  updateTitle: function( value ){
    this.ui.title.text( value );
  }

});