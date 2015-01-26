var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');

module.exports = LayoutView.extend({

  initialize: function(options){
    options = options || {};
    this.order = options.order;
    this.template = _.template( $('#tmpl-cart').html() );

    this.listenTo(this.listRegion, 'show', function(cart){
      this.onShowCart(cart);
    });
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
  onShowCart: function(cart){
    if(cart.isEmpty()){
      this.$el.addClass('cart-empty');
    }

    this.listenToOnce(cart, 'add:child', function(){
      this.$el.removeClass('cart-empty');
    });
  }

});