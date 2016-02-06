var FormView = require('lib/config/form-view');
var hbs = require('handlebars');
var _ = require('lodash');

module.exports = FormView.extend({

  template: hbs.compile( '{{note}}' ),

  attributes: {
    contenteditable: true,
    style: 'display:none'
  },

  modelEvents: {
    'change:note': function(){
      this.model.save();
    }
  },

  events: {
    'keypress': 'saveOnEnter'
  },

  bindings: {
    ':el': {
      observe: 'note',
      onGet: function (val) {
        val = _.isString(val) ? val.trim() : '';
        if (val) {
          this.$el.show();
        } else {
          this.$el.hide();
        }
        return val;
      },
      onSet: function (val) {
        val = _.isString(val) ? val.trim() : '';
        if (val !== this.$el.html()) {
          this.$el.text(val);
        }
        if (val) {
          this.$el.show();
        } else {
          this.$el.hide();
        }
        return val;
      }
    }
  },

  showNoteField: function(){
    this.$el.show().focus();
  },

  saveOnEnter: function(e) {
    // save note on enter
    if (e.which === 13) {
      e.preventDefault();
      this.$el.blur();
    }
  }

});