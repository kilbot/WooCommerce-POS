var accounting = require('accounting');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var Utils = {};

/**
 * Rounding to precision
 */
Utils.round = function( num, precision ) {
  if( !_.isFinite( parseInt(precision, 10) ) ) {
    precision = accounting.settings.currency.precision;
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
  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }
  if( !_.isFinite( parseInt(precision, 10) ) ) {
    precision = accounting.settings.currency.precision;
  }
  return accounting.formatNumber(num, precision);
};

/**
 *
 */
Utils.formatMoney = function( num, precision ) {
  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }
  if( !_.isFinite( parseInt(precision, 10) ) ) {
    precision = accounting.settings.currency.precision;
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

/**
 * returns the variable type
 * http://wp.me/pQpop-JM
 *
 *
toType({a: 4}); //"object"
toType([1, 2, 3]); //"array"
(function() {console.log(toType(arguments))})(); //arguments
toType(new ReferenceError); //"error"
toType(new Date); //"date"
toType(/a-z/); //"regexp"
toType(Math); //"math"
toType(JSON); //"json"
toType(new Number(4)); //"number"
toType(new String("abc")); //"string"
toType(new Boolean(true)); //"boolean"

 */
Utils.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

module.exports = POS.Utils = Utils;