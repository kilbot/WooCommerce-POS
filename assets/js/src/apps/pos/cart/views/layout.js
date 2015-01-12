var LayoutView = require('lib/config/layout-view');
var _ = require('underscore');
var $ = require('jquery');

module.exports = LayoutView.extend({
  initialize: function(){
    this.template = _.template( $('#tmpl-cart').html() );
  },
  tagName: 'section',
  regions: {
    listRegion      : '.list',
    totalsRegion    : '.list-totals',
    customerRegion  : '.cart-customer',
    actionsRegion   : '.cart-actions',
    notesRegion     : '.cart-notes',
    footerRegion    : '.list-footer'
  },
  attributes: {
    'class'         : 'module cart-module'
  }
});