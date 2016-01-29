var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');
var _ = require('lodash');

module.exports = Collection.extend({
  model: Model,

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'pos/settings';
  },

  constructor: function(models, options) {
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings'
    });

    // tack on tabsArray, @todo find a better way
    this.tabsArray = _.map( settings,
      _.partial( _.ary(_.pick, 2), _, ['id', 'label'] )
    );

    //models = this.parseSettings( settings );
    options = _.extend( {}, options, { parse: true } );

    return Collection.prototype.constructor.call(this, settings, options);
  }

});