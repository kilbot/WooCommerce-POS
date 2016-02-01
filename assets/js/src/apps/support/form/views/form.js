var FormView = require('lib/config/form-view');
var $ = require('jquery');

module.exports = FormView.extend({
  tagName: 'ul',
  template: 'support.form',

  ui: {
    toggle : '[data-action="toggle"]'
  },

  events: {
    'click @ui.toggle': 'toggleReport'
  },

  bindings: {
    '*[data-name="name"]'     : 'name',
    '*[data-name="email"]'    : 'email',
    '*[data-name="message"]'  : 'message',
    '*[name="append_report"]' : 'append_report',
    '*[name="report"]'        : 'report'
  },

  toggleReport: function(e) {
    e.preventDefault();
    $(e.currentTarget).next('textarea').toggle();
  }

});