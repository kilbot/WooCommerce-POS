var View = require('lib/config/item-view');

var Actions = View.extend({
  template: function(){
    return '<a href="#" data-action="print" class="button-primary">Print</a>';
  },

  ui: {
    print: '[data-action="print"]'
  },

  triggers: {
    'click @ui.print': 'print'
  }

});

module.exports = Actions;