var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');

module.exports = Model.extend({

  type: 'shipping',

  defaults: function(){
    return {
      method_title  : polyglot.t('titles.shipping'),
      taxable       : true,
      method_id     : ''
    };
  }

});