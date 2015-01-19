var Service = require('lib/config/service');
var Backbone = require('backbone');
var LayoutView = require('./layout-view');
var $ = require('jquery');

module.exports = Service.extend({
  channelName: 'modal',

  initialize: function(options){
    this.container = options.container;
    this.start();
  },

  onStart: function(){
    this.channel.reply({
      'open' : this.open,
      'close' : this.close,
      'alert' : this.alert,
      'confirm' : this.confirm,
      'prompt' : this.prompt
    }, this);

    this.layout = new LayoutView();
    this.container.show(this.layout);

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

  alert: function(options){
    //var deferred = $.Deferred();
    //var view = new AlertView(options);
    //
    //view.on({
    //  'confirm' : deferred.resolve,
    //  'cancel'  : deferred.resolve
    //});
    //
    //return deferred;
  },

  confirm: function(options){
    //var deferred = $.Deferred();
    //var view = new ConfirmView(options);
    //
    //view.on({
    //  'confirm' : deferred.resolve,
    //  'cancel'  : deferred.reject
    //});
    //
    //return deferred;
  },

  prompt: function(options){
    //var deferred = $.Deferred();
    //var view = new PromptView(options);
    //
    //view.on({
    //  'submit' : deferred.resolve,
    //  'cancel' : deferred.reject
    //});
    //
    //return deferred;
  },

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
  }

});