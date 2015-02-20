var ItemView = require('lib/config/item-view');
var _ = require('lodash');
var $ = require('jquery');
var bb = require('backbone');
var hbs = require('handlebars');
var AutoGrow = require('lib/components/autogrow/behavior');
var Numpad = require('lib/components/numpad/behavior');
var entitiesChannel = bb.Radio.channel('entities');
var Utils = require('lib/utilities/utils');

module.exports = ItemView.extend({
  tagName: 'ul',

  initialize: function() {
    this.template = hbs.compile( $('#tmpl-cart-totals').html() );

    this.options = entitiesChannel.request('get', {
      type : 'option',
      name : 'tax'
    });
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    },
    Numpad: {
      behaviorClass: Numpad
    }
  },

  modelEvents: {
    'change': 'render'
  },

  ui: {
    discount: '.order-discount'
  },

  events: {
    'click @ui.discount .total'   : 'edit',
    'keypress @ui.discount input'   : 'saveOnEnter',
    'blur @ui.discount input'     : 'onBlur'
  },

  /**
   *
   */
  templateHelpers: function(){
    var data = {};

    if( this.options.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.cart_discount = this.model.get('subtotal') - this.model.get('total');
      data.incl_tax = true;
    }

    // itemized
    if( this.options.tax_total_display === 'itemized' ){
      data.itemized = true;
    }

    // original total for calculating percentage discount
    data.original = this.model.sum(['total', 'order_discount']);

    return data;
  },

  edit: function(e) {
    $(e.currentTarget).addClass('editing')
        .children('input')
        .trigger('show:numpad');
  },

  save: function(e) {
    var input   = $(e.target),
      value   = input.val();

    // check for sensible input
    if( _.isNaN( parseFloat( value ) ) ) {
      input.select();
      return;
    }

    // always store numbers as float
    if( value ){
      value = Utils.unformat( value );
      value = parseFloat( value );
    }

    // save
    this.model.save({ order_discount: value });

  },

  saveOnEnter: function(e) {
    if (e.which === 13) {
      this.save(e);
      this.model.trigger('change');
    }
  },

  showDiscountRow: function() {
    this.$('.order-discount')
        .show()
        .children('.total')
        .trigger('click');
  },

  onBlur: function(e) {
    if( $(e.target).attr('aria-describedby') === undefined ) {
      this.save(e);
      this.model.trigger('change');
    }
  }

});