var version = version || '';
var _ = require('lodash');
var debugFunc = require('debug');
var bb = require('backbone');

/**
 * check debugging flag
 */
bb.Radio.DEBUG = debugFunc().enabled;

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
    _.merge(this, nestedObj);
  },
  create: function(app){
    return _.defaults( app, this );
  },
  debug: debugFunc
};