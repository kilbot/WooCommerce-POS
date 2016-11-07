var FormView = require('lib/config/form-view');

module.exports = FormView.extend({

  tagName: 'tr',

  initialize: function(options){
    options = options || {};
    this.template = function() {
      return options._template;
    };
  },

  bindings: {
    'input[data-name="order"]'  : 'order',
    'input[data-name="label"]'  : 'label',
    'input[data-name="filter"]' : 'filter'
  },

  ui: {
    removeTab : 'a[data-action="remove-tab"]',
  },

  triggers: {
    'click @ui.removeTab' : 'remove:tab'
  },

  onRemoveTab: function(){
    this.model.destroy();
  }

});