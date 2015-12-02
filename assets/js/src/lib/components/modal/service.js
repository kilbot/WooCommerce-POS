var Service = require('lib/config/service');
var Modal = require('vex-js');
var App = require('lib/config/application');
var prefix = App.prototype.namespace('modal');
var _ = require('lodash');
var Layout = require('./layout.js');
var bb = require('backbone');
var mn = require('backbone.marionette');
var globalChannel = require('backbone.radio').channel('global');

// css classes
Modal.baseClassNames = {
  vex     : prefix,
  content : prefix + '-content',
  overlay : prefix + '-overlay',
  close   : prefix + '-close',
  closing : prefix + '-closing',
  open    : prefix + '-open'
};

module.exports = Service.extend({
  channelName: 'modal',

  initialize: function(){
    this.channel.reply({
      open    : this.open,
      close   : this.close,
      error   : this.error
    }, this);

    // global error messages
    globalChannel.on({
      'error'   : this.error
    }, this);
  },

  open: function(options){
    options = this.parseOptions( options );

    options = _.extend( {
      showCloseButton       : false,
      overlayClosesOnClick  : false
    }, options );

    var modal = Modal.open( options );
    var region = new mn.Region({ el: modal });
    options.className = undefined; // note className leaks into Layout View
    return region.show( new Layout( options ) );
  },

  close: function( id ){
    id = parseInt( id, 10 );
    return Modal.close( id );
  },

  alert: function(){

  },

  confirm: function(){

  },

  prompt: function(){

  },

  error: function( options ){
    options = _.extend( {
      className   : 'error',
      footer      : {
        buttons: [
          {
            action: 'close'
          }
        ]
      }
    }, this.parseOptions( options ) );
    return this.open( options );
  },

  parseOptions: function( options ){

    // simple message
    if( _.isString(options) ){
      options = { message: options };

    // backbone view
    } else if( options instanceof bb.View ) {
      options = {view: options};

    // ajaxError
    } else if( _.isObject( options ) && options.jqXHR ){
      options = this.parseXHR( options );
    }

    return options;
  },

  parseXHR: function(options){
    var title, message;
    if( options.thrownError ){
      title = options.thrownError.name;
      message = options.thrownError.message;
    } else {
      title = options.jqXHR.statusText;
      if( options.jqXHR.responseJSON && options.jqXHR.responseJSON.errors[0] ){
        message = options.jqXHR.responseJSON.errors[0].message;
      }
    }
    return {
      header: {
        title: title
      },
      message: message,
      raw: options.jqXHR.responseText
    }
  }

});