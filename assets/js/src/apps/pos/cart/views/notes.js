var ItemView = require('lib/config/item-view');
var _ = require('lodash');

module.exports = ItemView.extend({
  template: _.template( '<%= note %>' ),

  modelEvents: {
    'change:note': 'render'
  },

  events: {
    'click'   : 'edit',
    'keypress'  : 'saveOnEnter',
    'blur'    : 'save'
  },

  onShow: function() {
    this.showOrHide();
  },

  showOrHide: function() {
    if( this.model.get('note') === '' ) {
      this.$el.parent('.cart-notes').hide();
    }
  },

  edit: function() {
    this.$el.attr('contenteditable','true').focus();
  },

  save: function() {
    var value = this.$el.text();

    // validate and save
    this.model.save({ note: value });
    this.$el.attr('contenteditable','false');
    this.showOrHide();
  },

  saveOnEnter: function(e) {
    // save note on enter
    if (e.which === 13) {
      e.preventDefault();
      this.$el.blur();
    }
  },

  showNoteField: function() {
    this.$el.parent('.cart-notes').show();
    this.$el.attr('contenteditable','true').focus();
  }
});