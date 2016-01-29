var DeepModel = require('lib/config/deep-model');
var _ = require('lodash');

/* jshint -W071, -W074  */
module.exports = DeepModel.extend({

  parse: function(resp) {
    // init
    if( _.has(resp, 'data') ){
      this.template = resp.template;
      this.sections = resp.sections;
      resp = _.defaults( { id: resp.id }, resp.data );
    }

    // save & restore
    if( resp && ! resp.id ){
      resp.id = this.id;
    }

    // https://github.com/jashkenas/backbone/issues/1069
    // https://github.com/kahwee/backbone-deep-model/issues/6
    var attr, attrs = this.objToPaths(resp);
    for( attr in this.objToPaths(this.attributes) ){
      if( attrs[attr] === undefined ){
        this.set( attr, undefined, { unset: true } );
      }
    }

    return resp;
  }

});
/* jshint +W071, +W074  */