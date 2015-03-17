var Service = require('lib/config/service');
var View = require('./view');
var _ = require('lodash');
var debug = require('debug')('loading');

module.exports = Service.extend({
  channelName: 'loading',

  initialize: function (options) {
    _.defaults(options, {
      type    : 'spinner',
      message : ''
    });

    if(options.container && this[options.type]){
      this[options.type](options);
    } else {
      debug('invalid loading options', options);
    }
  },

  spinner: function(options){
    var view = new View({
      message: options.message
    });
    options.container.show(view);
  },

  opacity: function(options){
    options.container.currentView.$el.css({
      'opacity': 0.5
    });
  }

});