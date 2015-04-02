var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  template: '#tmpl-receipt',

  tagName: 'section',

  regions: {
    status  : '.status',
    list    : '.list',
    totals  : '.list-totals',
    actions : '.list-actions'
  },

  className: function(){
    return 'module receipt-module ' + this.model.get('status');
  }

});