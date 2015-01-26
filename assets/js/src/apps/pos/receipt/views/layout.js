var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');

module.exports = LayoutView.extend({

  initialize: function(options){
    options = options || {};
    this.template = _.template( $('#tmpl-receipt').html() );
  },

  tagName: 'section',

  regions: {
    receiptRegion  : '.receipt',
    actionsRegion  : '.receipt-actions'
  },

  attributes: {
    'class'         : 'module receipt-module'
  }

});