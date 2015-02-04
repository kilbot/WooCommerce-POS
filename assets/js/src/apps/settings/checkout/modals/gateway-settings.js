var FormView = require('lib/config/form-view');
var $ = require('jquery');
var Tooltip = require('lib/components/tooltip/behavior');
var Radio = require('backbone').Radio;

module.exports = FormView.extend({
  tagName: 'table',
  className: 'form-table',

  initialize: function () {
    if(this.model.isNew()){
      this.model.fetch();
    }
    this.modalAttributes();
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  modelEvents: {
    'change:title': function(modal, value){
      Radio.command('modal', 'update:title', value);
    }
  },

  modalAttributes: function(){
    this.modal = {
      title: this.model.get('title')
    };
  },

  onRender: function(){
    var self = this;
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
  },

  save: function() {
    this.model.save();
  },

  cancel: function () {
  }

});