var FormView = require('lib/config/form-view');
var hbs = require('handlebars');
var $ = require('jquery');
var Numpad = require('lib/components/numpad/behavior');

module.exports = FormView.extend({
  initialize: function() {
    var method = this.model.id;
    this.template = hbs.compile(
      $('script[data-gateway="' + method + '"]').html()
    );
  },

  behaviors: {
    Numpad: {
      behaviorClass: Numpad
    }
  },

  ui: {

  },

  events: {

  },

  bindings: {

  },

  onShow: function() {
    this.$el.hide().slideDown(250);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      FormView.prototype.remove.call(this);
    }.bind(this));
  }
});