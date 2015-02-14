var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var Tooltip = require('lib/components/tooltip/behavior');

var View = FormView.extend({
  attributes: {
    id: 'wc-pos-settings-hotkeys'
  },

  initialize: function() {
    var id = this.model.id;
    this.template = function(){
      return $('script[data-id="' + id + '"]').html();
    };
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