var FormView = require('./form-view');
var app = require('./application');
var $ = require('jquery');
var Tooltip = require('lib/behaviors/tooltip');
var hbs = require('handlebars');

module.exports = app.prototype.SettingsView = FormView.extend({


  attributes: function(){
    return {
      id : 'wc_pos-settings-' + this.model.id
    };
  },

  constructor: function() {
    // setup model first
    FormView.prototype.constructor.apply(this, arguments);
    this.template = hbs.compile( this.model.template );
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