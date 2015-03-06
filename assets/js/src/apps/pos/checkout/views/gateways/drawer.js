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

  templateHelpers: function(){
    return {
      total: this.model.collection.order_total
    }
  },

  behaviors: {
    Numpad: {
      behaviorClass: Numpad
    }
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

  onShow: function() {
    this.$el.hide().slideDown(250);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      FormView.prototype.remove.call(this);
    }.bind(this));
  }
});