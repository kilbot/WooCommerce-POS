var ItemView = require('lib/config/form-view');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: 'pos.cart.totals',

  modelEvents: {
    'change': 'render'
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

    return data;
  }

});