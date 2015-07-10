var bb = require('backbone');
var _ = require('lodash');

module.exports = bb.Model.extend({

  dec: '',

  defaults: {
    active: 'value'
  },

  precision: 4,

  initialize: function(attributes, options){
    options = options || {};
    this.numpad = options.numpad;

    this.set({ value: options.value.toString() });

    if(options.precision){
      this.precision = options.precision;
    }

    if(options.original){
      this.initPercentage(options);
    }
  },

  initPercentage: function(options){
    if(options.percentage === 'off'){
      this.percentageOff = true;
    }

    this.set({ original: options.original.toString() });
    this.set({ percentage: this.calcPercentage() });

    this.on({
      'change:value': function(){
        this.set({ percentage: this.calcPercentage() }, { silent: true });
      },
      'change:percentage': function(){
        this.set({ value: this.calcValue() }, { silent: true });
      }
    });
  },

  getFloatValue: function(){
    return parseFloat( this.get('value') );
  },

  getActive: function(type){
    var active = this.get( this.get('active') );
    return type === 'float' ? parseFloat(active) : active.toString();
  },

  setActive: function(num){
    if(this.dec === '.'){
      this.dec = '';
    }
    if( _.isNaN(num) ){
      num = 0;
    }
    this.set( this.get('active'), this.round(num) );
  },

  backSpace: function(){
    var num = this.getActive().slice(0, -1);
    // remove trailing decimal
    if( num.slice(-1) === '.' ){
      num = num.slice(0, -1);
    }
    this.setActive( num );
    return this;
  },

  plusMinus: function(){
    var num = this.getActive('float') * -1;
    this.setActive( num );
    return this;
  },

  clearInput: function(){
    this.setActive( '' );
    return this;
  },

  key: function(key){
    var num = this.getActive();
    if(this.decimalPlaces(num) < this.precision){
      this.setActive( num + this.dec + key );
    }
    return this;
  },

  decimal: function(){
    this.dec = this.getActive().indexOf('.') === -1 ? '.' : '';
    return this;
  },

  quantity: function( type ) {
    var num = this.getActive('float');
    this.setActive( (type === 'increase' ? ++num : --num) );
    return this;
  },

  calcPercentage: function(){
    var value      = parseFloat( this.get('value') ),
      original   = parseFloat( this.get('original') ),
      percentage = ( value / original ) * 100;

    if(this.percentageOff){
      return this.round(100 - percentage);
    }

    return this.round(percentage);
  },

  calcValue: function(){
    var percentage = parseFloat( this.get('percentage') ),
      original   = parseFloat( this.get('original') ),
      multiplier = percentage / 100;

    if(this.percentageOff){
      return this.round(( 1 - multiplier ) * original);
    }

    return this.round(multiplier * original);
  },

  toggle: function(attr){
    this.set({ active: (attr === this.get('active') ? 'value' : attr) });
  },

  round: function(val){
    val = val.toString();
    if(this.decimalPlaces(val) > this.precision){
      val = parseFloat(val).toFixed(this.precision);
      val = parseFloat(val).toString();
    }
    return val;
  },

  decimalPlaces: function(val){
    return val.replace(/^-?\d*\.?|0+$/g, '').length;
  }

});