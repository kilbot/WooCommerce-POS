var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  template: '#tmpl-cart',

  initialize: function(options){
    options = options || {};
    this.order = options.order;
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