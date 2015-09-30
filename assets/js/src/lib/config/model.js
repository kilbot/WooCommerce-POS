var bb = require('backbone');
var app = require('./application');
var _ = require('lodash');
//var Radio = require('backbone.radio');

// parsing functions
var parse = {
  'float': parseFloat,
  'int': parseInt,
  'number': function(num){
    num = Number(num);
    return _.isNaN(num) ? 0 : num;
  }
};

module.exports = app.prototype.Model = bb.Model.extend({

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