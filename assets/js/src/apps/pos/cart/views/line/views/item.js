var FormView = require('lib/config/form-view');
var Utils = require('lib/utilities/utils');
var AutoGrow = require('lib/behaviors/autogrow');
var Numpad = require('lib/components/numpad/behavior');
var _ = require('lodash');

module.exports = FormView.extend({
  template: 'pos.cart.item',

  className: 'list-row',

  templateHelpers: function(){
    return {
      product   : this.model.type === 'product',
      shipping  : this.model.type === 'shipping',
      fee       : this.model.type === 'fee'
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

  bindings: {
    'input[name="quantity"]' : {
      observe: 'quantity',
      onGet: function(value) {
        return Utils.formatNumber(value, 'auto');
      },
      onSet: Utils.unformat
    },

    // product: name, shipping: method_title, fee: title
    '*[data-name="name"]' : { observe: 'name', events: ['blur'] },
    '*[data-name="method_title"]' : {observe: 'method_title', events: ['blur']},
    '*[data-name="title"]' : { observe: 'title', events: ['blur'] },

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
    'input[name="item_price"]': {
      observe: 'item_price',
      onGet: Utils.formatNumber,
      onSet: Utils.unformat
    },
    '.total': {
      observe: ['total', 'subtotal', 'tax_class', 'taxable'],
      updateMethod: 'html',
      onGet: function() {
        var total     = this.model.getDisplayTotal(),
            subtotal  = this.model.getDisplaySubtotal();

        if( ! subtotal || total === subtotal ){
          return Utils.formatMoney( total );
        }

        return '<del>' + Utils.formatMoney( subtotal ) + '</del> ' +
          '<ins>' + Utils.formatMoney( total ) + '</ins>';
      }
    }
  },

  removeItem: function(e) {
    if(e) { e.preventDefault(); }
    var self = this;
    this.ui.remove.attr('disabled', 'true');
    this.$el.addClass('pulse-out')
      .fadeOut(500, function(){
      self.model.destroy();
    });
  },

  focusTitle: function(){
    this.ui.title.find('strong').focus();
  }

});