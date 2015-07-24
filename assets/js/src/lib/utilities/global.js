var _ = require('lodash');
var debugFunc = require('debug');
var $ = require('jquery');
var Radio = require('backbone.radio');

if(window.wc_pos_debug){
  debugFunc.enable('*');
}

var debug = debugFunc().enabled;
Radio.DEBUG = debug;
console.info(
  'Debugging is ' +
  ( debug ? 'on' : 'off' )  +
  ', visit http://woopos.com.au/docs/debugging'
);

/**
 * create a global variable
 */
module.exports = {
  VERSION: __VERSION__, // injected by webpack
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