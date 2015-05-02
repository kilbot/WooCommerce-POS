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
    this.listenTo(view, 'open:modal', this.openModal);
    this.container.show(view);
  },

  openModal: function(id, view){
    var model = this.model.collection.add({
      id: 'gateway_' + id
    });

    if(!model.get('title')){
      this.initModalData(model, view);
    }

    var modal = new GatewaySettingsModal({
      tmpl: view.modalTmpl,
      model: model
    });

    var self = this;
    Radio.request('modal', 'open', modal)
      .then(function(args){
        var buttons = args.view.getButtons();
        self.listenTo(buttons, 'action:save', function(btn){
          model.save([], { buttons: btn });
        });
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
POS.attach('SettingsApp.Route', SettingsRoute);