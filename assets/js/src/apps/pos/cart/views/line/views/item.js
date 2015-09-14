var FormView = require('lib/config/form-view');
var Utils = require('lib/utilities/utils');
var bb = require('backbone');
var Radio = bb.Radio;
var AutoGrow = require('lib/behaviors/autogrow');
var Numpad = require('lib/components/numpad/behavior');
var _ = require('lodash');

module.exports = FormView.extend({
  template: 'pos.tmpl-cart-item',

  initialize: function() {
    this.tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    }) || {};
  },

  templateHelpers: function(){
    var type = this.model.get('type');
    return {
      product: (type !== 'shipping' && type !== 'fee')
    };
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
    remove  : '*[data-action="remove"]',
    more    : '*[data-action="more"]',
    title   : '.title'
  },

  events: {
    'click @ui.remove': 'removeItem',
    'click @ui.title': 'focusTitle'
  },

  triggers: {
    'click @ui.more'  : 'drawer:toggle'
  },

  modelEvents: {
    'change:title'        : 'save',
    'change:method_title' : 'save'
  },

  bindings: {
    'input[name="quantity"]' : {
      observe: 'quantity',
      onGet: function(value) {
        return Utils.formatNumber(value, 'auto');
      },
      onSet: Utils.unformat
    },
    '*[data-name="title"]' : {
      observe: 'title',
      events: ['blur']
    },
    'dl.meta': {
      observe: 'meta',
      updateMethod: 'html',
      onGet: function(val){
        var row = '';
        _.each(val, function(meta){
          row += '<dt>' + meta.label + ':</dt><dd>' + meta.value + '</dd>';
        });
        return row;
      }
    },
    '*[data-name="method_title"]': 'method_title',
    'input[name="item_price"]': {
      observe: 'item_price',
      onGet: Utils.formatNumber,
      onSet: Utils.unformat
    },
    '.total': {
      observe: ['total', 'subtotal', 'tax_class', 'taxable'],
      updateMethod: 'html',
      onGet: function(value) {
        if( this.tax.tax_display_cart === 'incl' ) {
          value[0] = this.model.sum(['total', 'total_tax']);
          value[1] = this.model.sum(['subtotal', 'subtotal_tax']);
        }

        var total     = Utils.formatMoney(value[0]),
            subtotal  = Utils.formatMoney(value[1]);

        if(total !== subtotal){
          return '<del>' + subtotal + '</del> <ins>' + total + '</ins>';
        } else {
          return total;
        }
      }
    }
  },

  save: function(){
    console.log(arguments);
    this.model.save();
  },

  removeItem: function(e) {
    if(e) { e.preventDefault(); }
    var self = this;
    this.ui.remove.attr('disabled', 'true');
    this.$el.addClass('bg-danger')
      .fadeOut(500, function(){
      self.model.destroy();
    });
  },

  focusTitle: function(){
    this.ui.title.find('strong').focus();
  }

});