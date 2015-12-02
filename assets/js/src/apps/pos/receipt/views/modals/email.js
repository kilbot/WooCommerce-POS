var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./email.hbs');

var View = ItemView.extend({

  template: hbs.compile(Tmpl),

  initialize: function(options){
    this.mergeOptions(options, ['email']);
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
    return {
      email: this.email
    };
  },

  getEmail: function(){
    return this.ui.email.val() || this.email;
  }

});

module.exports = View;
App.prototype.set('POSApp.Receipt.Views.Email', View);