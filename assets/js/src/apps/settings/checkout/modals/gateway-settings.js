var FormView = require('lib/config/form-view');
var $ = require('jquery');
var Tooltip = require('lib/behaviors/tooltip');

module.exports = FormView.extend({
  tagName: 'table',
  className: 'form-table',

  initialize: function () {
    var title = this.model.get('title');

    if(!title){
      this.model.fetch();
    }

    // modal setup
    this.modal = {
      header: {
        title: title
      },
      footer: {
        buttons: [
          {
            type: 'message'
          },{
            action    : 'save',
            className : 'button-primary',
            icon      : 'prepend',
            disabled  : !title
          }
        ]
      }
    };
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  //modelEvents: {
  //  'change:title': function(modal, value){
  //    var update = {};
  //    update.header = { title: value };
  //    if(this.model.isNew()){
  //      update.footer = {
  //        buttons: [{
  //          action: 'save',
  //          disabled: false
  //        }]
  //      };
  //    }
  //    Radio.command('modal', 'update', update);
  //  }
  //},

  onRender: function(){
    var self = this;
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });
  }

});