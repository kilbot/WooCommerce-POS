var Route = require('lib/config/route');
var POS = require('lib/utilities/global');
var Layout = require('./layout');
var Form = require('./form');
var $ = require('jquery');
var Radio = require('backbone.radio');
var Buttons = require('lib/components/buttons/view');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
    this.model = Radio.request('entities', 'get', {
      type: 'model',
      name: 'supportForm'
    });

    var label = $('#tmpl-support-form').data('title');
    Radio.command('header', 'update:tab', {id: 'left', label: label});
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
    var view = new Form({
      model: this.model
    });
    this.layout.form.show( view );
  },

  showActions: function(){
    var view = new Buttons({
      buttons: [{
        action: 'send',
        className: 'btn btn-success'
      }]
    });

    this.listenTo(view, 'action:send', function(){
      this.model.save([], { buttons: view });
    });

    this.layout.actions.show(view);
  }

});

module.exports = FormRoute;
POS.attach('SupportApp.Form.Route', FormRoute);
