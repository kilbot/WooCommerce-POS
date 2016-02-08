var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./error.hbs');
var parse = require('./parser');
var polyglot = require('lib/utilities/polyglot');
var _ = require('lodash');

module.exports = ItemView.extend({

  modal: {
    header: {
      title: polyglot.t('titles.error', { _ : 'Error' })
    },
    footer : {
      buttons: [
        {
          action: 'close'
        }
      ]
    }
  },

  template: hbs.compile(Tmpl),

  initialize: function( options ){
    options = options || {};

    // parse error and merge with defaults
    this.error = _.defaults( parse( options.error ), {
      message: polyglot.t('messages.error', {
        _ : 'Sorry, there has been an error.'
      }),
      moreInfo: polyglot.t('titles.more-info', { _ : 'More info' })
    });

    // set the modal title
    if( this.error.title ){
      this.modal.header.title = this.error.title;
    }
  },

  templateHelpers: function(){
    return this.error;
  }

});