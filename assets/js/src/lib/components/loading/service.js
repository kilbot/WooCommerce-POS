var Service = require('lib/config/service');
var View = require('./view');
var _ = require('lodash');
var debug = require('debug')('loading');

module.exports = Service.extend({
  channelName: 'loading',

  initialize: function (options) {
    options = options || {};
    this.container = options.container;

    if(!this.container){
      debug('invalid loading container', options);
      return;
    }

    _.defaults(options, {
      type    : 'spinner',
      message : ''
    });

    if(this[options.type]){
      this[options.type](options);
    } else {
      debug('invalid loading type', options);
    }
  },

  spinner: function(options){
    var view = new View({
      message: options.message
    });
    this.container.show(view);
  },

  opacity: function(){
    this.container.currentView.$el.css({
      'opacity': 0.5
    });
  }

});