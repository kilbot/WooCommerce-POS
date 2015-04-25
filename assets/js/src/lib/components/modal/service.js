var Service = require('lib/config/service');
var Backbone = require('backbone');
var LayoutView = require('./views/layout');
var AlertView = require('./views/alert');
var $ = require('jquery');
var _ = require('lodash');
var globalChannel = require('backbone.radio').channel('global');

module.exports = Service.extend({
  channelName: 'modal',

  initialize: function(options){
    this.container = options.container;
    this.start();
  },

  onStart: function(){
    this.channel.reply({
      'open'    : this.open,
      'close'   : this.close,
      'alert'   : this.alert,
      'confirm' : this.confirm,
      'prompt'  : this.prompt
    }, this);

    this.layout = new LayoutView();
    this.container.show(this.layout);

    this.channel.comply({
      'update': this.layout.update
    }, this.layout);

    globalChannel.on({
      'error'   : this.error
    }, this);

    this.listenTo(Backbone.history, {
      'route' : this.onRoute
    });
  },

  onStop: function(){
    delete this.layout;
    this.container.reset();
    this.channel.reset();
  },

  onRoute: function(){
    if (this.fragment !== Backbone.history.fragment) {
      this.close();
    }
  },

  //alert: function(options){
  //  var deferred = $.Deferred();
  //  var view = new AlertView(options);
  //
  //  view.on({
  //    'confirm' : deferred.resolve,
  //    'cancel'  : deferred.resolve
  //  });
  //
  //  return deferred;
  //},
  //
  //confirm: function(options){
  //  var deferred = $.Deferred();
  //  var view = new ConfirmView(options);
  //
  //  view.on({
  //    'confirm' : deferred.resolve,
  //    'cancel'  : deferred.reject
  //  });
  //
  //  return deferred;
  //},
  //
  //prompt: function(options){
  //  var deferred = $.Deferred();
  //  var view = new PromptView(options);
  //
  //  view.on({
  //    'submit' : deferred.resolve,
  //    'cancel' : deferred.reject
  //  });
  //
  //  return deferred;
  //},

  open: function(view){
    var self = this;
    this.fragment = Backbone.history.fragment;
    return this.close().then(function() {
      self.isOpen = true;
      return self.layout.open(view);
    });
  },

  close: function(){
    if (this.isOpen) {
      this.isOpen = false;
      return this.layout.close();
    } else {
      return $.Deferred().resolve();
    }
  },

  error: function(options){
    options = options || {};

    if(options.jqXHR){
      this.parseXHR(options);
    }

    var view = new AlertView({
      className : 'error',
      title     : options.status,
      message   : options.message,
      raw       : options.raw
    });

    this.open(view);
  },

  parseXHR: function(options){
    if( _.isObject(options.thrownError) ){
      options.status = options.thrownError.name;
      options.message = options.thrownError.message;
    } else {
      options.status = options.jqXHR.statusText;
      if( options.jqXHR.responseJSON && options.jqXHR.responseJSON.errors[0] ){
        options.message = options.jqXHR.responseJSON.errors[0].message;
      }
    }
    options.raw = options.jqXHR.responseText;
  }

});