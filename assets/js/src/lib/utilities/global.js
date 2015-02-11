var version = version || '';
var _ = require('lodash');
var debugFunc = require('debug');
var $ = require('jquery');
var Radio = require('backbone.radio');

/**
 * check debugging flag
 */
Radio.DEBUG = debugFunc().enabled;

console.info(
  'Debugging is ' +
  ( debugFunc().enabled ? 'on' : 'off' )  +
  ', visit http://woopos.com.au/docs/debugging'
);

/**
 * create a global variable
 */
module.exports = {
  VERSION: version,
  attach: function(deepProperty, value){
    deepProperty = deepProperty.split('.');
    var nestedObj = _.reduceRight(deepProperty, function (child, parent) {
      var obj = {};
      obj[parent] = child;
      return obj;
    }, value || {});
    $.extend(true, this, nestedObj);
  },
  create: function(app){
    return _.defaults( app, this );
  },
  debug: debugFunc,
  getOption: function(){}
};