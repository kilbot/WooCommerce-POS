var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var View = require('./view');
var GatewaySettingsModal = require('./modals/gateway-settings');
var Radio = require('backbone.radio');

var SettingsRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  fetch: function() {
    if(this.model.isNew()){
      return this.model.fetch();
    }
  },

  render: function() {
    var view = new View({
      model: this.model
    });
    this.listenTo(view, 'gateway:settings', this.openGatewaySettingsModal);
    this.container.show(view);
  },

  openGatewaySettingsModal: function(id, tmpl){
    var model = this.model.collection.add({
      id: 'gateway_' + id
    });

    var view = new GatewaySettingsModal({
      template: tmpl,
      model: model
    });

    var self = this;
    Radio.request('modal', 'open', view)
      .then(function(args){
        var buttons = args.view.getRegion('footer').currentView;

        self.listenTo(buttons, 'action:save', function(btn, view){
          model.save([], {
            success: function(model, resp){
              btn.trigger('state', 'success');
              if(resp.success){
                view.triggerMethod('message', resp.success, 'success');
              } else {
                view.triggerMethod('message', 'success');
              }
            },
            error: function(jqxhr){
              btn.trigger('state', 'error');
              if(jqxhr.responseJSON && jqxhr.responseJSON.errors){
                view.triggerMethod(
                  'message', jqxhr.responseJSON.errors[0].message, 'error'
                );
              } else {
                view.triggerMethod('message', 'error');
              }
            }
          });
        });

        //self.listenTo(args.view, 'change:title', function(){
        //
        //});
      });

  }
});

module.exports = SettingsRoute;
POS.attach('SettingsApp.Route', SettingsRoute);