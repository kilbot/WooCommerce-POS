var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var Layout = require('./layout');
var Form = require('./views/form');
var $ = require('jquery');
var Radio = require('backbone.radio');
var Buttons = require('lib/components/buttons/view');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
    this.setTabLabel({
      tab   : 'left',
      label : polyglot.t('titles.support-form')
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
        type: 'message'
      },{
        action: 'send',
        className: 'btn-success',
        icon: 'prepend'
      }]
    });

    this.listenTo(view, 'action:send', this.email);

    this.layout.getRegion('actions').show(view);
  },

  email: function(btn, view){
    var form = this.layout.getRegion('form').currentView,
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

    btn.trigger('state', 'loading');
    view.triggerMethod('message', 'reset');

    var onError = function(message){
      btn.trigger('state', 'error');
      view.triggerMethod('message', message, 'error');
    };

    var onSuccess = function(data){
      if(!_.isObject(data) || data.result !== 'success'){
        return onError(data.message);
      }
      btn.trigger('state', 'success');
      view.triggerMethod('message', data.message, 'success');
    };

    $.post( ajaxurl, data )
    .done(onSuccess)
    .fail(onError);
  }

});

module.exports = FormRoute;
POS.attach('SupportApp.Form.Route', FormRoute);
