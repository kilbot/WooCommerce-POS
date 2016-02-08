var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./header.hbs');
var polyglot = require('lib/utilities/polyglot');

module.exports = ItemView.extend({

  title: polyglot.t('messages.loading', { _ : 'Loading' }),
  close: polyglot.t('buttons.close', { _ : 'Close' }),
  template: hbs.compile(Tmpl),

  initialize: function(options){
    this.mergeOptions( options, ['title', 'close'] );
  },

  templateHelpers: function(){
    return {
      title: this.title,
      close: this.close
    };
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