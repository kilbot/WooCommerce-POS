var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  columns: 2,

  template: function(){
    return '' +
      '<section id="left"></section>' +
      '<section id="right"></section>';
  },

  regions: {
    left: '#left',
    right: '#right'
  }
});