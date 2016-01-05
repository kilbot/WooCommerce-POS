var FormView = require('./form-view');
var app = require('./application');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/behaviors/tooltip');

module.exports = app.prototype.SettingsView = FormView.extend({

  constructor: function(options) {
    var id = _.get( options, ['model', 'id'] );

    this.template = 'settings.' + id;

    this.attributes = {
      id: 'wc_pos-settings-' + id
    };

    return FormView.prototype.constructor.apply(this, arguments);
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