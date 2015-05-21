var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({

  className: 'print-preview',

  template: function(){
    return '' +
      '<div id="iframe"></div>' +
      '<div id="actions"></div>';
  },

  regions: {
    iframe: '#iframe',
    actions: '#actions'
  }

});