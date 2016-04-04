var Behavior = require('lib/config/behavior');
var $ = require('jquery');
var App = require('lib/config/application');
var namespace = App.prototype.namespace('buttons');

var ToggleBehavior = Behavior.extend({

  initialize: function(){
    this.listenTo(this.view, 'toggle:reset', this.reset);
  },

  ui: {
    buttons: '*[data-toggle="' + namespace + '"]'
  },

  events: {
    'click @ui.buttons': 'onClick'
  },

  onClick: function(e){
    e.preventDefault();
    var target = $(e.target);
    var nodeName = e.target.nodeName;

    if(nodeName !== 'A' && nodeName !== 'BUTTON'){
      return;
    }

    $(e.currentTarget).find(nodeName).removeClass('active');
    target.addClass('active');
    this.view.trigger('toggle', target);
  },

  reset: function(){
    $('a, button', this.ui.buttons).removeClass('active');
  }

});

module.exports = ToggleBehavior;
App.prototype.set('Behaviors.Toggle', ToggleBehavior);