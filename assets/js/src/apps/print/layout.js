var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({

  tagName: 'section',

  className: 'panel print-preview',

  template: function(){
    return '' +
      '<div class="panel-body print-preview-iframe"></div>' +
      '<div class="print-preview-actions"></div>';
  },

  regions: {
    iframe  : '.print-preview-iframe',
    actions : '.print-preview-actions'
  }

});