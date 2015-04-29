var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./email.hbs');

var View = ItemView.extend({

  template: hbs.compile(Tmpl),

  initialize: function(){
    this.modal = {
      header: {
        title: polyglot.t('titles.email-receipt')
      },
      footer: {
        buttons: [
          {
            type: 'message'
          }, {
            action: 'send',
            className: 'btn-success',
            icon: 'prepend'
          }
        ]
      }
    };
  },

  ui: {
    email: 'input'
  },

  templateHelpers: function(){
    var data = {
      email: this.getOption('email')
    };
    return data;
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Email', View);