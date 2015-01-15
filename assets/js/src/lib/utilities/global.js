var version = version || '';
var _ = require('lodash');

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
  }
};