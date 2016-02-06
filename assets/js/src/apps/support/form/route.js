var Route = require('lib/config/route');
var App = require('lib/config/application');
var Layout = require('./layout');
var Form = require('./views/form');
var Buttons = require('lib/components/buttons/view');
var polyglot = require('lib/utilities/polyglot');
var Model = require('./model');

var FormRoute = Route.extend({

  initialize: function(options){
    this.container = options.container;
    this.setTabLabel( polyglot.t('titles.support-form') );
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
    this.form = new Form( { model: new Model() } );
    this.layout.getRegion('form').show( this.form );
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

    this.listenTo(view, 'action:send', function(){
      this.form.model.save();
    });

    this.layout.getRegion('actions').show(view);
  }

});

module.exports = FormRoute;
App.prototype.set('SupportApp.Form.Route', FormRoute);
