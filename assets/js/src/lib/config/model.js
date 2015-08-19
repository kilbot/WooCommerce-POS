var bb = require('backbone');
var POS = require('lib/utilities/global');
var _ = require('lodash');
//var Radio = require('backbone.radio');

// parsing functions
var parse = {
  'float': parseFloat,
  'int': parseInt,
  'number': Number
};

module.exports = POS.Model = bb.Model.extend({

  constructor: function() {
    bb.Model.apply(this, arguments);
  },

  parse: function (resp){
    var data = resp && resp[this.name] ? resp[this.name]  : resp;
    if( ! data ){
      return;
    }

    // check data type
    _.each( this.schema, function( val, attr ) {

      // if attribute exists
      if( ! _.has( data, attr ) ){
        return;
      }

      // string, eg: 'float'
      if( _.isString(val) && parse[val] ){
        data[attr] = parse[val]( data[attr] );
      }

    }, this);

    return data;
  }

});