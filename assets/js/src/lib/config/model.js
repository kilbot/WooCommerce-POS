var bb = require('backbone');
var app = require('./application');
var _ = require('lodash');
var schema = require('./model-schema');

module.exports = app.prototype.Model = bb.Model.extend({

  constructor: function(){
    // model schema
    if( this.schema ){
      this.parse = _.wrap( this.parse, schema.parse );
    }
    bb.Model.apply( this, arguments );
  }

});