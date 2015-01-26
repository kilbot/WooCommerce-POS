var accounting = require('accounting');
var POS = require('lib/utilities/global');

module.exports = POS.Utils = {

  /**
   * Number and Currency helpers
   */
  round: function( num, precision ) {
    if( precision === undefined ) {
      precision = accounting.settings.number.precision;
    }
    return parseFloat( accounting.toFixed( num, precision ) );
  },

  unformat: function( num ) {
    return accounting.unformat( num, accounting.settings.number.decimal );
  },

  formatNumber: function( num, precision ) {
    if( precision === undefined ) {
      precision = accounting.settings.number.precision;
    }
    if( precision === 'auto' ) {
      precision = this.decimalPlaces(num);
    }
    return accounting.formatNumber(num, precision);
  },

  formatMoney: function( num, precision ) {
    if( precision === undefined ) {
      precision = accounting.settings.currency.precision;
    }
    if( precision === 'auto' ) {
      precision = this.decimalPlaces(num);
    }
    // round the number to even
    num = this.round(num, precision);
    return accounting.formatMoney(num);
  },

  isPositiveInteger: function( num, allowZero ){
    var n = ~~Number(num);
    if(allowZero) {
      return String(n) === num && n >= 0;
    } else {
      return String(n) === num && n > 0;
    }
  },

  decimalPlaces: function(num){
    return ((+num).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
  },

  /**
   * Parse error messages from the server
   */
  parseErrorResponse: function( jqXHR ){
    var resp = jqXHR.responseJSON;
    if( resp.errors ){
      return resp.errors[0].message;
    }

    return jqXHR.responseText;
  }

};