var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  columns: 2,
  template: function(){
    return '<div id="left"></div><div id="right"></div>';
  },
  regions: {
    leftRegion: '#left',
    rightRegion: '#right'
  }
});