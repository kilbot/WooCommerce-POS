var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({

  el: '#wpbody-content .wrap',

  template: function(){
    return '' +
      '<div id="wc_pos-admin"></div>' +
      '<div id="wc_pos-modal"></div>';
  },

  regions: {
    main : '#wc_pos-admin',
    modal: '#wc_pos-modal'
  }

});