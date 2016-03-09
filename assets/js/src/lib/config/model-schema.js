/**
 * Simple schema parsing for Backbone Models
 */
var _ = require('lodash');

var fns = {
  'float' : parseFloat,
  'int'   : parseInt,
  'number': function (num) {
    num = Number(num);
    return _.isNaN(num) ? 0 : num;
  }
};

module.exports = {

  parse: function( modelParse, options ){
    var parse, resp = modelParse.call(this, options);

    _.each( this.schema, function( value, attr ) {
      parse = fns[value];
      if( _.has(resp, attr) && parse ){
        resp[attr] = parse( resp[attr] );
      }
    });

    return resp;
  }

};