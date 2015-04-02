var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({

  el: '#wpbody-content .wrap',

  template: function(){
    return '' +
      '<div id="wc-pos-admin"></div>' +
      '<div id="wc-pos-modal"></div>';
  },

  regions: {
    main : '#wc-pos-admin',
    modal: '#wc-pos-modal'
  }

});