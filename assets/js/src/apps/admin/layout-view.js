var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');

module.exports = LayoutView.extend({

  el: '#wpbody-content .wrap',

  template: function(){
    return '<div id="wc-pos-admin"></div>' +
      '<div id="wc-pos-modal"></div>';
  },

  regions: {
    mainRegion  : '#wc-pos-admin',
    modalRegion : '#wc-pos-modal'
  }

});