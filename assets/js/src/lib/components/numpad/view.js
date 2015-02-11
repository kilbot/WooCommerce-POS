var FormView = require('lib/config/form-view');
var Tmpl = require('./numpad.hbs');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');

var View = FormView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(){

  },

  ui: {
    input : '.numpad-header input',
    toggle: '.numpad-header .btn',
    keys  : '.numpad-keys .btn'
  },

  events: {
    'click @ui.input' : 'input',
    'click @ui.toggle': 'toggle',
    'click @ui.keys'  : 'keys'
  },

  input: function(e){
    console.log(e);
  },

  toggle: function(e){
    e.preventDefault();
    console.log(e);
  },

  modifier: function(e){
    var modifier = $(e.currentTarget).data('modifier'),
      value = this.model.get('value');

    if( this.model.get('type') === 'quantity' ) {
      this.model.set('value', (modifier === 'increase' ? ++value : --value) );
    }

    if( this.model.get('type') === 'discount' ){
      this.model.set({ mode: modifier });
    }
  },

  onChangeMode: function(){
    this.$('a[data-modifier]').toggleClass( 'disabled' );
    this.$('input').toggle();
  },

  keys: function(e){
    e.preventDefault();

    var key = $(e.currentTarget),
      parent = key.parent(),
      keyValue = key.text();

    // set decimal flag
    if( key.hasClass('decimal') ){
      this.decimal = true;
      return;
    }

    //
    if( parent.hasClass('extra-keys discount') ) {
      this.discountKeys(keyValue);
      return;
    }

    //
    if( parent.hasClass('extra-keys tendered') ) {
      this.tenderedKeys(keyValue);
      return;
    }

    this.standardKeys(keyValue);
    this.decimal = false;
  },

  standardKeys: function(keyValue){
    var data = {},
      newValue,
      decimal,
      mode = this.model.get('mode'),
      oldValue = mode === 'percentage' ?
        this.model.get('percentage') : this.model.get('value');

    switch(keyValue) {
      case 'return':
        this.trigger('return:keypress');
        return;
      case 'del':
        newValue =
          Math.abs( oldValue ) < 10 ? 0 : oldValue.toString().slice(0, -1);
        break;
      case '+/-':
        newValue = oldValue*-1;
        break;
      default:
        oldValue = oldValue.toString();
        decimal = this.decimal && oldValue.indexOf('.') === -1 ? '.' : '';
        newValue = oldValue + decimal + keyValue;
    }

    console.log(newValue);
    //data[mode] = newValue;
    //this.model.set(data);

  },

  standardKeys: function(keyValue){
    var data = {},
      newValue,
      decimal,
      mode = this.model.get('mode'),
      oldValue = mode === 'percentage' ? this.model.get('percentage') : this.model.get('value');

    switch(keyValue) {
      case 'return':
        this.trigger('return:keypress');
        return;
      case 'del':
        newValue = Math.abs( oldValue ) < 10 ? 0 : oldValue.toString().slice(0, -1);
        break;
      case '+/-':
        newValue = oldValue*-1;
        break;
      default:
        oldValue = oldValue.toString();
        decimal = this.decimal && oldValue.indexOf('.') === -1 ? '.' : '';
        newValue = oldValue + decimal + keyValue;
    }

    data[mode] = newValue;
    this.model.set(data);

  },

  discountKeys: function(keyValue){
    var discount = keyValue.replace('%', '');
    this.model.set({
      percentage: parseFloat(discount),
      mode: 'percentage'
    });
  },

  tenderedKeys: function(keyValue) {
    this.model.set({ value: parseFloat(keyValue) });
  },

  // create 4 quick keys based on amount
  cashKeys: function(){
    var coins = POS.denominations.coins,
      notes = POS.denominations.notes,
      amount = parseFloat( this.model.get('original') ),
      keys = [],
      x;

    if( amount === 0 ) {
      return notes.slice(-4);
    }

    // round for two coins
    _.each( coins, function(coin) {
      if( _.isEmpty(keys) ) {
        x = Math.round( amount / coin );
      } else {
        x = Math.ceil( amount / coin );
      }
      keys.push( x * coin );
    });

    keys = _.uniq(keys, true).slice(0, 2);


    // round for two notes
    _.each( notes, function(note) {
      x = Math.ceil( amount / note );
      keys.push( x * note );
    });

    keys = _.uniq(keys, true).slice(0, 4);

    return keys;
  }

});

module.exports = View;
POS.attach('Components.Numpad.View', View);