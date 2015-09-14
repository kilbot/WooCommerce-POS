var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  template: 'pos.tmpl-cart',

  initialize: function(options){
    options = options || {};
    this.order = options.order;
  },

  tagName: 'section',

  regions: {
    list      : '.list',
    totals    : '.list-totals',
    customer  : '.cart-customer',
    actions   : '.list-actions',
    note      : '.cart-notes',
    footer    : '.list-footer'
  },

  attributes: {
    'class'   : 'module cart-module'
  },

  /**
   * add/remove cart-empty class
   */
  onShow: function(){
    this.$el.toggleClass('cart-empty', !this.order);
  }

});