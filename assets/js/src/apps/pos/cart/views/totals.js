var ItemView = require('lib/config/form-view');
var Radio = require('backbone.radio');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: 'pos.tmpl-cart-totals',

  initialize: function() {
    this.tax = Radio.request('entities', 'get', {
      type : 'option',
      name : 'tax'
    }) || {};
  },

  // todo: why is this necessary?!
  // view should re-render automatically on model change
  modelEvents: {
    'change': 'render'
  },

  /**
   *
   */
  templateHelpers: function(){
    var data = {
      itemized: this.tax.tax_total_display === 'itemized',
      has_discount: 0 !== this.model.get('cart_discount')
    };

    if( this.tax.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.cart_discount = this.model.sum(
        ['cart_discount', 'cart_discount_tax']
      );
      data.incl_tax = true;
    }

    return data;
  }

});