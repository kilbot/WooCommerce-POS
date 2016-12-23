var ItemView = require('lib/config/form-view');
var $ = require('jquery');
var Dropdown = require('lib/behaviors/dropdown');
var Coupons = require('./coupons-list');
var Radio = require('backbone.radio');
var _ = require('lodash');
var Mn = require('backbone.marionette');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: 'pos.cart.totals',

  modelEvents: {
    'change': 'render'
  },

  ui: {
    toggleTax: 'a[data-action="toggle-tax"]',
    couponSearch: 'input',
    removeCoupon: 'a[data-action="remove-coupon"]'
  },

  events: {
    'click @ui.toggleTax': 'toggleTax',
    'input @ui.couponSearch': 'couponSearch',
    'click @ui.removeCoupon': 'removeCoupon'
  },

  behaviors: {
    Dropdown: {
      behaviorClass: Dropdown
    }
  },

  initialize: function(){
    _.bindAll( this, 'dropdownContent' );
    this.coupons = Radio.request('entities', 'get', 'coupons');
  },

  /**
   *
   */
  templateHelpers: function(){
    var data = {
      itemized: this.model.tax.tax_total_display === 'itemized',
      incl_tax: this.model.tax.tax_display_cart === 'incl',
      has_discount: 0 !== this.model.get('cart_discount')
    };

    if( data.incl_tax ) {
      data.subtotal = this.model.getDisplaySubtotal();
      data.cart_discount = this.model.getDisplayCartDiscount();
    }

    // sum for disabled taxes
    data.total_tax = this.model.sumItemizedTaxes(
      this.model.get('tax_lines'), 'total'
    );

    return data;
  },

  /**
   *
   */
  toggleTax: function(e){
    if(e){ e.preventDefault(); }
    var rate_id = $(e.currentTarget).data('rate_id');
    this.model.toggleTax( rate_id );
  },

  couponSearch: function(){
    var value = this.ui.couponSearch.val();
    this._query(value);
  },

  _query: _.debounce( function(value){
    this.coupons
      .setQuery('search', value)
      .fetch();
  }, 149),

  removeCoupon: function(e){
    e.preventDefault();
    var coupon_id = $(e.currentTarget).data('coupon_id');
    var coupons = this.model.coupons.findWhere({ id: coupon_id });
    this.model.coupons.remove( coupons );
    this.render();
  },

  dropdownContent: function( drop ){
    this.couponsRegion = new Mn.Region({
      el: drop.content
    });

    // reposition on filter
    this.listenTo( this.coupons, 'reset', function(){
      drop.position.call(drop);
    });

    // reposition on show
    this.listenTo( this.couponsRegion, 'show', function(){
      drop.position.call(drop);
    });

    return ''; // return empty content
  },

  onDropdownOpen: function(){
    var view = new Coupons({
      collection: this.coupons
    });

    this.listenTo(view, 'childview:coupon:selected', function(view){
      var newCoupons = this.model.coupons.where({ id: '' });
      this.model.coupons.remove(newCoupons, { silent: true });
      this.model.coupons.add(view.model);
      this.render();
    });

    this.couponsRegion.show(view);
  },

  onDropdownClose: function(){
    this.couponsRegion.empty();
  },

  onTargetKeydown: function(e){
    this.couponsRegion.currentView.moveFocus(e.which);
  },

});