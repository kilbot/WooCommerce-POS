var bb = require('backbone');
var app = require('./application');
var _ = require('lodash');

var fns = {
  'float'  : parseFloat,
  'integer': parseInt,
  'int'    : parseInt,
  'number' : function (num) {
    num = Number(num);
    return _.isNaN(num) ? 0 : num;
  }
};

module.exports = app.prototype.Model = bb.Model.extend({

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
  }

});