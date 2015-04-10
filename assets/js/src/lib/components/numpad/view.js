var FormView = require('lib/config/form-view');
var Tmpl = require('./numpad.hbs');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
var accounting = require('accounting');
var AutoGrow = require('lib/behaviors/autogrow');
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');
var Utils = require('lib/utilities/utils');
var $ = require('jquery');
var _ = require('lodash');

var View = FormView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    _.extend(this, {
      target : options.target,
      parent : options.parent,
      type   : options.target.data('numpad')
    });

    if(this.type === 'discount'){
      this.discountSetup();
    }

    if(this.type === 'cash'){
      this.cashSetup();
    }

    // select input on open
    _.bindAll(this, 'selectInput');
    this.target.one('shown.bs.popover', this.selectInput);
  },

  bindings: function(){
    var parent = this.parent || {};
    // copy binding from parent
    if(! _.isEmpty(parent.bindings) ){
      return parent.bindings;
    }
    // .. or simple bind to target
    var hash = {};
    var name = this.target.attr('name');
    hash['*[name="' + name + '"]'] = name;
    return hash;
  },

  ui: {
    input   : '.numpad-header input',
    toggle  : '.numpad-header .input-group',
    common  : '.numpad-keys .common .btn',
    discount: '.numpad-keys .discount .btn',
    cash    : '.numpad-keys .cash .btn',
    keys    : '.numpad-keys .btn'
  },

  events: {
    'click @ui.toggle a': 'toggle',
    'click @ui.common'  : 'commonKeys',
    'click @ui.discount': 'discountKeys',
    'click @ui.cash'    : 'cashKeys',
    'keypress @ui.input': 'enter',
    'mousedown @ui.keys': 'blur'
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
      quick_keys: this.quick_keys,
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

  /* jshint -W074 */
  /* todo: too complex */
  commonKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key'),
        input = this.ui.input.filter(':visible'),
        decimal = accounting.settings.currency.decimal,
        oldValue = input.val().toString(),
        newValue;

    switch(key) {
      case 'ret':
        this.target.popover('hide');
        return;
      case 'del':
        if(this.selection) { oldValue = ''; }
        newValue = oldValue.slice(0, -1);
        break;
      case '+/-':
        newValue = Utils.unformat(oldValue)*-1;
        break;
      case '.':
        var dec = oldValue.indexOf(decimal) === -1 ? decimal : '';
        newValue = oldValue + dec;
        break;
      default:
        if(this.selection) { oldValue = ''; }
        newValue = oldValue + key;
    }

    this.ui.input.filter(':visible').val(newValue).trigger('input');
  },
  /* jshint +W074 */

  discountSetup: function(){
    var current = this.model.get(this.target.attr('name')),
        original = this.model.get(this.target.data('original'));

    this.discount_keys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'discount_keys'
    });

    this.model.set({ percentage: this.calcDiscount(current, original) });

    this.bindings['input[name="percentage"]'] = {
      observe: 'percentage',
      onGet: function (value) {
        return Utils.formatNumber(value, 0);
      },
      onSet: function (value) {
        this.applyDiscount(value, original);
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

  applyDiscount: function(value, original){
    var newValue = (1 - (value/100)) * original;
    this.model.set({'item_price': newValue});
  },

  selectInput: function(){
    this.ui.input.filter(':visible').select();
  },

  enter: function(e) {
    if (e.which === 13) {
      this.target.popover('hide');
    }
  },

  /* jshint -W071 */
  /* todo: too many statements */
  cashSetup: function(){
    var denominations = Radio.request('entities', 'get', {
      type: 'option',
      name: 'denominations'
    }) || {},
      amount = this.target.data('original') || 0,
      keys = [],
      x;

    if(amount === 0) {
      this.quick_keys = denominations.notes.slice(-4);
      return;
    }

    // round for two coins
    _.each( denominations.coins, function(coin) {
      if( _.isEmpty(keys) ) {
        x = Math.round( amount / coin );
      } else {
        x = Math.ceil( amount / coin );
      }
      keys.push( x * coin );
    });

    keys = _.uniq(keys, true).slice(0, 2);


    // round for two notes
    _.each( denominations.notes, function(note) {
      x = Math.ceil( amount / note );
      keys.push( x * note );
    });

    keys = _.uniq(keys, true).slice(0, 4);

    this.quick_keys = keys;
  },
  /* jshint +W071 */

  cashKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key');
    this.model.set(this.target.attr('name'), key);
  },

  // everytime the input loses focus
  blur: function(){
    var sel = window.getSelection();
    this.selection = sel.toString().length > 0;
  }

});

module.exports = View;
POS.attach('Components.Numpad.View', View);