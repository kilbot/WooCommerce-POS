var FormView = require('lib/config/form-view');
var $ = require('jquery');
var App = require('lib/config/application');
var Tooltip = require('lib/behaviors/tooltip');

var View = FormView.extend({

  template: 'hotkeys',

  attributes: {
    id: 'wc-pos-settings-hotkeys'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  modelEvents: {
    'change:id': 'render'
  },

  onRender: function(){
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });

  }

});

module.exports = View;
App.prototype.set('SettingsApp.HotKeys.View');