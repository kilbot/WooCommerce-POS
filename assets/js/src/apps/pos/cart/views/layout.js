var LayoutView = require('lib/config/layout-view');
var _ = require('lodash');
var $ = require('jquery');

module.exports = LayoutView.extend({

  initialize: function(options){
    options = options || {};
    this.order = options.order;

    this.template = _.template( $('#tmpl-cart').html() );

    if(this.order.cart){
      this.listenTo(this.order.cart, 'add remove', this.showOrHide);
    }
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
  },

  showOrHide: function(){
    var regions = this.getRegions(),
        items = this.order.cart.length,
        toggle = items === 0 ? 'hide' : 'show';

    _.chain(regions)
      .omit('listRegion')
      .values()
      .map(function(region){
        region.$el[toggle]();
      });
  }

});