var app = require('./application');
var bb = require('backbone');
var _ = require('lodash');
var extend = require('./extend');
var sync = require('./sync');

/**
 * app.Collection can inherit from these subclasses
 * - note: order is important
 */
var subClasses = {
  idb       : require('backbone-indexeddb/src/model'),
  dual      : require('backbone-dual-storage/src/model'),
  filtered  : require('backbone-filtered/src/model')
};

/**
 * Schema options
 */
var fns = {
  'float'  : parseFloat,
  'integer': parseInt,
  'int'    : parseInt,
  'number' : function (num) {
    num = Number(num);
    return _.isNaN(num) ? 0 : num;
  }
};

var Model = bb.Model.extend({

  constructor: function(attributes, options){
    // model schema
    if( this.schema ){
      _.extend(options, {parse: true});
    }
    bb.Model.call( this, attributes, options );
  },

  parse: function(resp){
    _.each( this.schema, function( value, attr ) {
      if( _.has(resp, attr) && fns[value] ){
        resp[attr] = fns[value]( resp[attr] );
      }
    });

    return resp;
  },

  sync: sync

});

/**
 * Custom class methods
 * - extend overwrites default extend
 * - _extend is a helper
 */
Model.extend = extend;
Model._extend = function(key, parent){
  var subClass = _.get(subClasses, key);
  if(subClass && !_.includes(parent.prototype._extended, key)){
    parent = subClass(parent);
    parent.prototype._extended = _.union(parent.prototype._extended, [key]);
  }
  return parent;
};

module.exports = app.prototype.Model = Model;