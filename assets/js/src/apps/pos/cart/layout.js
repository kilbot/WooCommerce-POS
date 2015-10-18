var LayoutView = require('lib/config/layout-view');

module.exports = LayoutView.extend({
  template: 'pos.cart.panel',

  initialize: function(options){
    options = options || {};
    this.order = options.order;
  },

  regions: {
    list      : '.cart-list',
    totals    : '.cart-totals',
    customer  : '.cart-customer',
    actions   : '.cart-actions',
    note      : '.cart-notes',
    footer    : '.cart-footer'
  },

  attributes: {
    'class'   : 'panel cart'
  },

  /**
   * add/remove cart-empty class
   */
  onShow: function(){
    this.$el.toggleClass('cart-empty', !this.order);
  }

});