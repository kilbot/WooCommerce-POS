var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');

module.exports = LayoutView.extend({

  initialize: function(options){
    options = options || {};
    this.order = options.order;
    this.template = _.template( $('#tmpl-cart').html() );
  },

  tagName: 'section',

  regions: {
    listRegion      : '.list',
    totalsRegion    : '.list-totals',
    customerRegion  : '.cart-customer',
    actionsRegion   : '.list-actions',
    notesRegion     : '.cart-notes',
    footerRegion    : '.list-footer'
  },

  attributes: {
    'class'         : 'module cart-module'
  },

  /**
   * add/remove cart-empty class
   */
  onShow: function(){
    this.$el.toggleClass('cart-empty', !this.order);
  }

});