var FormView = require('lib/config/form-view');
var Utils = require('lib/utilities/utils');
var bb = require('backbone');
var Radio = bb.Radio;
var AutoGrow = require('lib/components/autogrow/behavior');
var Numpad = require('lib/components/numpad/behavior');
var hbs = require('handlebars');
var $ = require('jquery');

module.exports = FormView.extend({
  initialize: function() {
    this.template = hbs.compile( $('#tmpl-cart-item').html() );
  },

  templateHelpers: function(){
    var data = {};
    var tax = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tax'
    });

    if( tax.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.total = this.model.sum(['total', 'total_tax']);
    }

    if( this.model.get('total') !== this.model.get('subtotal') ){
      data.discount = true;
    }

    return data;
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
    more    : '*[data-action="more"]'
  },

  events: {
    'click @ui.remove' : 'removeItem'
  },

  triggers: {
    'click @ui.more'   : 'drawer:toggle'
  },

  bindings: {
    'input[name="qty"]' : {
      observe: 'qty',
      onGet: function(value) {
        return Utils.formatNumber(value, 'auto');
      },
      onSet: Utils.unformat
    },
    'strong.action-edit-title': 'title',
    'input[name="item_price"]': {
      observe: 'item_price',
      onGet: Utils.formatNumber,
      onSet: Utils.unformat
    },
    '.total': {
      observe: ['total', 'subtotal'],
      updateMethod: 'html',
      onGet: function(value) {
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

  remove: function() {
    // Remove the validation binding
    bb.Validation.unbind(this);

    // disable button
    this.$('.action-remove').attr( 'disabled', 'true' );

    // add bg colour and fade out
    this.$el.addClass('bg-danger').closest('ul').addClass('animating');
    this.$el.fadeOut( 500, function() {
      this.$el.closest('ul').removeClass('animating');
      this.trigger('animation:finished');
      bb.Marionette.ItemView.prototype.remove.call(this);
    }.bind(this));
  },

  removeItem: function() {
    this.model.destroy();
  }

});