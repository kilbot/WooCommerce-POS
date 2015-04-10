var FormView = require('lib/config/form-view');
var $ = require('jquery');
var hbs = require('handlebars');
var AutoGrow = require('lib/behaviors/autogrow');
var Numpad = require('lib/components/numpad/behavior');
var Radio = require('backbone.radio');
var Utils = require('lib/utilities/utils');

module.exports = FormView.extend({
  tagName: 'ul',

  initialize: function() {
    this.template = hbs.compile( $('#tmpl-cart-totals').html() );

    this.tax = Radio.request('entities', 'get', {
      type : 'option',
      name : 'tax'
    }) || {};
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    },
    Numpad: {
      behaviorClass: Numpad
    }
  },

  ui: {
    discount: '.order-discount'
  },

  events: {
    'click @ui.discount'      : 'edit',
    'blur @ui.discount input' : 'onBlur'
  },

  // todo: why is this necessary?!
  // view should re-render on model change
  modelEvents: {
    'change': 'render'
  },

  bindings: {
    'input[name="order_discount"]': {
      observe: 'order_discount',
      onGet: Utils.formatNumber,
      onSet: Utils.unformat
    },
    '.order-discount span.amount': {
      observe: 'order_discount',
      updateMethod: 'html',
      onGet: function(val){
        val = val*-1;
        return Utils.formatMoney(val);
      }
    },
    '.order-total .total': {
      observe: 'total',
      updateMethod: 'html',
      onGet: Utils.formatMoney
    }
  },

  /**
   *
   */
  templateHelpers: function(){
    var data = {};

    if( this.tax.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.cart_discount = this.model.get('subtotal') - this.model.get('total');
      data.incl_tax = true;
    }

    // itemized
    data.itemized = this.tax.tax_total_display === 'itemized';

    // original total for calculating percentage discount
    data.original = this.model.sum(['total', 'order_discount']);

    return data;
  },

  edit: function() {
    var container = this.ui.discount,
        input = container.find('input');

    container.addClass('editing');
    input.trigger('open:numpad');

    input.one('hidden.bs.popover', function(){
      container.removeClass('editing');
    });

  },

  showDiscountRow: function() {
    this.ui.discount.show();
    this.edit();
  }

});