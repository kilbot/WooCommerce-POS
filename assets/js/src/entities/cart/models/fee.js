var Model = require('./abstract');
var polyglot = require('lib/utilities/polyglot');

module.exports = Model.extend({

  type: 'fee',

  defaults: function(){
    return {
      title   : polyglot.t('titles.fee'),
      taxable : true
    };
  }

});