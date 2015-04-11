var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var polyglot = require('lib/utilities/polyglot');
var Radio = require('backbone.radio');
var $ = require('jquery');
var _ = require('lodash');

var View = ItemView.extend({

  template: hbs.compile('' +
    '<div class="input-group">' +
    '<span class="input-group-addon">@</span>' +
    '<input type="text" class="form-control" placeholder="{{email}}">' +
    '</div>'
  ),

  initialize: function(){
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
      email: this.getOption('email')
    };
    return data;
  },

  sendEmail: function(){
    var self = this,
        email = this.ui.email.val(),
        order_id = this.getOption('order_id'),
        ajaxurl = Radio.request('entities', 'get', {
          type: 'option',
          name: 'ajaxurl'
        });

    if(email === ''){
      email = this.getOption('email');
    }

    if(!order_id || email === ''){
      return;
    }

    var onError = function(message){
      var obj = { type: 'error' };
      if(message){
        obj.text = message;
      }
      self.trigger('complete:send', obj);
    };

    var onSuccess = function(data){
      var obj = { type: 'success'},
          message;

      if(!_.isObject(data) || data.result !== 'success'){
        if(data.message){ message = data.message; }
        return onError(message);
      }

      obj.text = data.message;
      self.trigger('complete:send', obj);
    };

    $.getJSON( ajaxurl, {
      action: 'wc_pos_email_receipt',
      order_id: order_id,
      email : email
    })
    .done(onSuccess)
    .fail(onError);
  }

});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Email', View);