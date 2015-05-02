var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var Tooltip = require('lib/behaviors/tooltip');

var View = FormView.extend({

  template: function(){
    return $('script[data-id="hotkeys"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-hotkeys'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
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
POS.attach('SettingsApp.HotKeys.View');