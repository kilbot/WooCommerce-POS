var accounting = require('accounting');
var POS = require('lib/utilities/global');
var Utils = {};

/**
 * Rounding to precision
 */
Utils.round = function( num, precision ) {
  if( precision === undefined ) {
    precision = accounting.settings.number.precision;
  }
  return parseFloat( accounting.toFixed( num, precision ) );
};

/**
 * Number of significant decimal places
 */
Utils.decimalPlaces = function(num){
  return ((+num).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
};

/**
 *
 */
Utils.unformat = function( num ) {
  return accounting.unformat( num, accounting.settings.number.decimal );
};

/**
 *
 */
Utils.formatNumber = function( num, precision ) {
  if( precision === undefined ) {
    precision = accounting.settings.number.precision;
  }
  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }
  return accounting.formatNumber(num, precision);
};

/**
 *
 */
Utils.formatMoney = function( num, precision ) {
  if( precision === undefined ) {
    precision = accounting.settings.currency.precision;
  }
  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }
  // round the number to even
  num = Utils.round(num, precision);
  return accounting.formatMoney(num);
};

/**
 *
 */
Utils.isPositiveInteger = function( num, allowZero ){
  var n = ~~Number(num);
  if(allowZero) {
    return String(n) === num && n >= 0;
  } else {
    return String(n) === num && n > 0;
  }
};

/**
 * Parse error messages from the server
 */
Utils.parseErrorResponse = function( jqXHR ){
  var resp = jqXHR.responseJSON;
  if( resp.errors ){
    return resp.errors[0].message;
  }

  return jqXHR.responseText;
};

module.exports = POS.Utils = Utils;