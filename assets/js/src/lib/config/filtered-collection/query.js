var _ = require('lodash');
var Parser = require('./parser');
var parser = new Parser();
var Utils = require('lib/utilities/utils');

var methods = {

  string: function(q, model){
    var attributes = _.pick(model.attributes, (model.fields || 'title'));
    return _.any( _.values( attributes ), function( attribute ) {
      return this._string(attribute, q.query.toLowerCase());
    }, this);
  },

  prefix: function(q, model){
    if(!q.query || q.query === ''){
      return false;
    }
    var attr = model.get(q.prefix),
        type = Utils.toType(attr);

    // _boolean, _array etc
    if(this.hasOwnProperty('_' + type)){
      return this['_' + type](attr, q.query.toLowerCase());
    }
  },

  _string: function(test, value){
    return test.toLowerCase().indexOf( value ) !== -1;
  },

  _number: function(test, value){
    return test.toString().indexOf( value ) !== -1;
  },

  _boolean: function(test, value){
    if(value === 'true'){
      return test === true;
    } else if (value === 'false'){
      return test === false;
    }
    return false;
  },

  _array: function(test, value){
    return _.any(test, function(option){
      return option.toLowerCase() === value;
    });
  }

};

module.exports = function(filter, model){

  var query = parser.parse(filter);

  // allow model specific match maker
  if(model.matchMaker){
    var match = model.matchMaker(query, methods);
    if(match === true){
      return true;
    }
    // halt or continue?
  }

  // any = OR?
  // all = AND?
  return _.all(query, function(q){
    return methods[q.type](q, model);
  });
};