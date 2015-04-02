var FormView = require('lib/config/form-view');
var $ = require('jquery');

module.exports = FormView.extend({
  tagName: 'ul',
  template: '#tmpl-support-form',

  ui: {
    toggle  : '.toggle'
  },

  events: {
    'click @ui.toggle': 'toggleReport'
  },

  toggleReport: function(e){
    e.preventDefault();
    $(e.currentTarget).next('textarea').toggle();
  },

  bindings: {
    '*[name="name"]': 'name',
    '*[name="email"]': 'email',
    '*[name="message"]': {
      observe: 'message',
      initialize: function(){
        //debugger;
      },
      onGet: function (value) {
        //debugger;
        return value;
      },
      onSet: function (value) {
        return value;
      }
    },
    '*[name="report"]': 'report'
  }

});