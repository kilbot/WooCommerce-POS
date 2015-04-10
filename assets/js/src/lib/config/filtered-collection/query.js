var _ = require('lodash');
var Parser = require('./parser');
var parser = new Parser();
var Utils = require('lib/utilities/utils');

/**
 * Helper methods for matching tokens
 */
var methods = {

  /**
   * Token type `string`
   * @return {Boolean}
   */
  string: function(token, model){
    token = token || {};
    if(!_.isString(token.query)){ return false; }

    var attributes = _.pick(model.attributes, (model.fields || 'title'));

    return _.any( _.values( attributes ), function( attribute ) {
      return this._partialString(attribute, token.query.toLowerCase());
    }, this);
  },

  /**
   * Token type `prefix`
   * @return {Boolean}
   */
  prefix: function(token, model){
    token = token || {};
    if(!_.isString(token.query)){ return false; }

    var attr = model.get(token.prefix),
        type = Utils.toType(attr);

    // _boolean, _array etc
    if(this.hasOwnProperty('_' + type)){
      return this['_' + type](attr, token.query.toLowerCase());
    }
  },

  /**
   * Token type `or`
   * @return {Boolean}
   */
  or: function(token, model){
    return _.any(token.queries, function(t){
      return this[t.type](t, model);
    }, this);
  },

  _string: function(str, value){
    return str.toLowerCase() === value;
  },

  _partialString: function(str, value){
    return str.toLowerCase().indexOf( value ) !== -1;
  },

  _number: function(number, value){
    return number.toString() === value;
  },

  _partialNumber: function(number, value){
    return number.toString().indexOf( value ) !== -1;
  },

  _boolean: function(bool, value){
    if(value === 'true'){
      return bool === true;
    } else if (value === 'false'){
      return bool === false;
    }
    return false;
  },

  _array: function(arr, value){
    return _.any(arr, function(elem){
      return elem.toLowerCase() === value;
    });
  }

};

function matchMaker(tokens, model){
  // match tokens
  // todo: all = AND, any = OR
  return _.all(tokens, function(token){
    return methods[token.type](token, model);
  });
}

/**
 * Match Maker
 * return true or false for model based on Qparser tokens
 * @param {String|Array} filter
 * @param {Object} model
 * @returns {Boolean}
 */
module.exports = function(filter, model){
  var tokens = _.isArray(filter) ? filter : parser.parse(filter);
  this._tokens = tokens;

  // allow model specific match maker
  if(model.matchMaker){
    return model.matchMaker(tokens, methods, matchMaker);
  } else {
    return matchMaker(tokens, model);
  }
};