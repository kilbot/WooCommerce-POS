var FormView = require('lib/config/form-view');
var Tmpl = require('./numpad.hbs');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
var accounting = require('accounting');
var AutoGrow = require('lib/components/autogrow/behavior');
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');
var Utils = require('lib/utilities/utils');

var View = FormView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    this.target   = options.target;
    this.bindings = options.parent.bindings;
    this.type     = options.target.data('numpad');

    if(this.type === 'discount'){
      this.discountSetup();
    }
  },

  ui: {
    input   : '.numpad-header input',
    toggle  : '.numpad-header .input-group',
    common  : '.numpad-keys .common .btn',
    discount: '.numpad-keys .discount .btn'
  },

  events: {
    'click @ui.input'   : 'input',
    'click @ui.toggle a': 'toggle',
    'click @ui.common'  : 'commonKeys',
    'click @ui.discount': 'discountKeys'
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    }
  },

  templateHelpers: function(){
    var data = {
      numpad: this.type,
      label : this.target.data('label'),
      name  : this.target.attr('name'),
      currency: {
        symbol  : accounting.settings.currency.symbol,
        decimal : accounting.settings.currency.decimal
      },
      discount_keys: this.discount_keys,
      buttons: {
        'return': polyglot.t('buttons.return')
      }
    };

    return data;
  },

  toggle: function(e){
    e.preventDefault();
    var modifier = $(e.currentTarget).data('modifier');

    if(this.type === 'quantity'){
      this.model.quantity(modifier);
    }

    if(this.type === 'discount'){
      this.ui.toggle.toggleClass('toggle');
    }
  },

  commonKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key'),
        decimal,
        newValue,
        oldValue = this.ui.input.filter(":visible").val();

    switch(key) {
      case 'ret':
        this.target.popover('hide');
        return;
      case 'del':
        newValue = oldValue.toString().slice(0, -1);
        break;
      case '+/-':
        newValue = oldValue*-1;
        break;
      default:
        oldValue = oldValue.toString();
        decimal = this.decimal && oldValue.indexOf('.') === -1 ? '.' : '';
        newValue = oldValue + decimal + key;
    }

    this.ui.input.filter(":visible").val(newValue).trigger('input');
  },

  discountSetup: function(){
    this.discount_keys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'discount_keys'
    });

    var current = this.model.get('item_price');
    var original = this.model.get('regular_price');
    this.model.set({ percentage: this.calcDiscount(current, original) });

    this.bindings['input[name="percentage"]'] = {
      observe: 'percentage',
      onGet: function (value) {
        return Utils.formatNumber(value, 0);
      },
      onSet: function (value) {
        this.applyDiscount(value);
        return value;
      }
    };
  },

  discountKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key');
    this.ui.toggle.addClass('toggle')
      .children('[name="percentage"]')
      .val(key)
      .trigger('input');
  },

  calcDiscount: function(a, b){
    return (1 - (a / b)) * 100;
  },

  applyDiscount: function(value){
    var original = this.model.get('regular_price');
    var newValue = (1 - (value/100)) * original;
    this.model.set({'item_price': newValue});
  }

});

module.exports = View;
POS.attach('Components.Numpad.View', View);