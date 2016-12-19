var ItemView = require('lib/config/form-view');
var $ = require('jquery');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: 'pos.cart.totals',

  modelEvents: {
    'change': 'render'
  },

  ui: {
    toggleTax: 'a[data-action="toggle-tax"]'
  },

  events: {
    'click @ui.toggleTax': 'toggleTax'
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

    // toggle taxes
    data.taxes_enabled = this.model.taxRateEnabled();

    return data;
  },

  /**
   *
   */
  toggleTax: function(e){
    if(e){ e.preventDefault(); }
    var rate_id = $(e.currentTarget).data('rate_id');
    this.model.toggleTax( rate_id );
  }

});