var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');
var $ = require('jquery');

var View = ItemView.extend({

  template: hbs.compile('' +
    '<div class="input-group">' +
    '<span class="input-group-addon">@</span>' +
    '<input type="text" class="form-control" placeholder="{{email}}">' +
    '</div>'
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

    this.on('action:send', this.sendEmail);
  },

  ui: {
    email: 'input'
  },

  templateHelpers: function(){
    var data = {
      email: this.email
    };
    return data;
  },

  sendEmail: function(){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    $.getJSON( ajaxurl, {
      action: 'wc_pos_email_receipt',
      email : this.ui.email.val()
    });
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Email', View);