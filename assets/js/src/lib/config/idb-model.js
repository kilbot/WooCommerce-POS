var DeepModel = require('./deep-model');
var app = require('./application');
var _ = require('lodash');

module.exports = app.prototype.IDBModel = DeepModel.extend({

  /**
   *
   */
  constructor: function( attributes, options ){
    this.db = _.get( options, ['collection', 'db'] );
    DeepModel.apply( this, arguments );
  }


});