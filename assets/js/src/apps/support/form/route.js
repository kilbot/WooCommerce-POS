var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var Layout = require('./layout');
var Form = require('./views/form');
var $ = require('jquery');
var Radio = require('backbone.radio');
var Buttons = require('lib/components/buttons/view');
var _ = require('lodash');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
    this.setTabLabel({
      tab   : 'left',
      label : $('#tmpl-support-form').data('title')
    });
  },

  fetch: function(){

  },

  render: function(){
    this.layout = new Layout();

    this.listenTo(this.layout, 'show', function(){
      this.showForm();
      this.showActions();
    });

    this.container.show(this.layout);
  },

  showForm: function(){
    var view = new Form();
    this.layout.getRegion('form').show( view );
  },

  showActions: function(){
    var view = new Buttons({
      buttons: [{
        action: 'send',
        className: 'btn btn-success'
      }]
    });

    this.listenTo(view, 'action:send', this.email);

    this.layout.getRegion('actions').show(view);
  },

  email: function(){
    var form = this.layout.getRegion('form').currentView,
        buttons = this.layout.getRegion('actions').currentView,
        data = {
          action  : 'wc_pos_send_support_email',
          name    : form.$('[data-name="name"]').text(),
          email   : form.$('[data-name="email"]').text(),
          message : form.$('[data-name="message"]').text(),
          status  : form.$('#pos_status').val()
        },
        ajaxurl = Radio.request('entities', 'get', {
          type: 'option',
          name: 'ajaxurl'
        });

    buttons.triggerMethod('Update', { message: 'spinner' });

    var onError = function(message){
      var obj = { type: 'error' };
      if(message){
        obj.text = message;
      }
      buttons.triggerMethod('Update', { message: obj });
    };

    var onSuccess = function(data){
      var obj = { type: 'success'},
        message;

      if(!_.isObject(data) || data.result !== 'success'){
        if(data.message){ message = data.message; }
        return onError(message);
      }

      obj.text = data.message;
      buttons.triggerMethod('Update', { message: obj });
    };

    $.post( ajaxurl, data )
    .done(onSuccess)
    .fail(onError);
  }

});

module.exports = FormRoute;
POS.attach('SupportApp.Form.Route', FormRoute);
