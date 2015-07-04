var accounting = require('accounting');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var Utils = {};

/**
 * Using the same function as Woo: /assets/js/admin/round.js
 * PHP_ROUND_HALF_EVEN should be the default?!
 * @param value
 * @param precision
 * @param mode
 * @returns {number}
 */
/* jshint -W018, -W071, -W074 */
Utils.round = function(value, precision, mode) {
  // http://kevin.vanzonneveld.net
  // +   original by: Philip Peterson
  // +    revised by: Onno Marsman
  // +      input by: Greenseed
  // +    revised by: T.Wild
  // +      input by: meo
  // +      input by: William
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Josep Sanz (http://www.ws3.es/)
  // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
  // %        note 1: Great work. Ideas for improvement:
  // %        note 1:  - code more compliant with developer guidelines
  // %        note 1:  - for implementing PHP constant arguments look at
  // %        note 1:  the pathinfo() function, it offers the greatest
  // %        note 1:  flexibility & compatibility possible
  // *     example 1: round(1241757, -3);
  // *     returns 1: 1242000
  // *     example 2: round(3.6);
  // *     returns 2: 4
  // *     example 3: round(2.835, 2);
  // *     returns 3: 2.84
  // *     example 4: round(1.1749999999999, 2);
  // *     returns 4: 1.17
  // *     example 5: round(58551.799999999996, 2);
  // *     returns 5: 58551.8

  //
  //mode = mode || 'PHP_ROUND_HALF_EVEN';

  if( !_.isFinite( parseInt(precision, 10) ) ) {
    precision = accounting.settings.currency.precision;
  }

  var m, f, isHalf, sgn; // helper variables
  //precision |= 0; // making sure precision is integer
  m = Math.pow(10, precision);
  value *= m;
  sgn = (value > 0) | -(value < 0); // sign of the number
  isHalf = value % 1 === 0.5 * sgn;
  f = Math.floor(value);

  if (isHalf) {
    switch (mode) {
      case '2':
      case 'PHP_ROUND_HALF_DOWN':
        value = f + (sgn < 0); // rounds .5 toward zero
        break;
      case '3':
      case 'PHP_ROUND_HALF_EVEN':
        value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
        break;
      case '4':
      case 'PHP_ROUND_HALF_ODD':
        value = f + !(f % 2); // rounds .5 towards the next odd integer
        break;
      default:
        value = f + (sgn > 0); // rounds .5 away from zero
    }
  }

  return (isHalf ? value : Math.round(value)) / m;
};
/* jshint +W018, +W071, +W074 */

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