var Route = require('lib/config/route');
var App = require('lib/config/application');
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
    this.listenTo(view, 'open:modal', this.openModal);
    this.container.show(view);
  },

  openModal: function(id, v){
    var model = this.model.collection.add({
      id: 'gateway_' + id
    });

    if(!model.get('title')){
      this.initModalData(model, v);
    }

    var view = new GatewaySettingsModal({
      tmpl: v.modalTmpl,
      model: model
    });

    var modal = Radio.request('modal', 'open', view);

    this.listenTo( modal.currentView, {
      'childview:action:save': function( view, btn ){
        model.save([], { buttons: btn });
      }
    });

    this.listenTo( model, {
      'change:title': function( model, value ){
        modal.currentView.getRegion('headerRegion')
          .currentView.updateTitle(value);
      }
    });
  },

  initModalData: function(model, view){
    function element(attr){
      return '#' + model.id + ' .gateway-' + attr;
    }
    var data = {
      title: view.$(element('name')).html(),
      description: view.$(element('description')).html(),
      icon: view.$(element('icon')).data('show') ? true : false
    };
    data.hasIcon = view.$(element('icon')).data('icon');
    model.set(data);
  }

});

module.exports = SettingsRoute;
App.prototype.set('SettingsApp.Route', SettingsRoute);