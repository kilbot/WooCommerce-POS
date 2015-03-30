var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');

var View = ItemView.extend({

  template: hbs.compile('' +
    '<input type="text" placeholder="{{email}}">'
  ),

  initialize: function(options){
    options = options || {};
    this.email = options.email;

    this.modal = {
      header: {
        title: polyglot.t('titles.email-receipt')
      },
      footer: {
        buttons: [
          {
            action: 'send',
            className: 'btn-success'
          }
        ]
      }
    };
  },

  templateHelpers: function(){
    var data = {
      email: this.email
    };
    return data;
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Email', View);