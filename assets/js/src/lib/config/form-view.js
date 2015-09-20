var ItemView = require('./item-view');
var bb = require('backbone');
var app = require('./application');
require('backbone.stickit');
require('backbone-validation');
require('lib/utilities/stickit-handlers');

module.exports = app.prototype.FormView = ItemView.extend({

  constructor: function() {
    return ItemView.prototype.constructor.apply(this, arguments);
  },

  bindings: {},

  render: function(){
    // Invoke original render function
    var args = Array.prototype.slice.apply(arguments);
    var result = ItemView.prototype.render.apply(this, args);

    // Apply validation
    bb.Validation.bind(this, {
      model: this.model,
      valid: function(view, attr) {
        view
          .$('input[name="' + attr + '"]')
          .parent()
          .removeClass('error');
      },
      invalid: function(view, attr) {
        view
          .$('input[name="' + attr + '"]')
          .parent()
          .addClass('error');
      }
    });

    // Apply stickit
    this.stickit();

    // Return render result
    return result;
  },

  remove: function() {
    // Remove the validation binding
    bb.Validation.unbind(this);
    return ItemView.prototype.remove.apply(this, arguments);
  }

});