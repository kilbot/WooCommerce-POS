var DeepModel = require('lib/config/deep-model');
var _ = require('lodash');

module.exports = DeepModel.extend({

  initialize: function( attrs, options ){
    options = options || {};
    this.template = options.template;
    this.sections = options.sections;
  },

  /**
   * https://github.com/jashkenas/backbone/issues/1069
   */
  parse: function(resp) {
    if( _.isObject( resp ) ){
      _.keys(this.attributes).forEach(function(key) {
        if (resp[key] === undefined) {
          resp[key] = undefined;
        }
      });
    }
    return resp;
  }

});