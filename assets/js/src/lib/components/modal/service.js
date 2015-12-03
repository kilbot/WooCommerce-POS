var Service = require('lib/config/service');
var Modal = require('vex-js');
var App = require('lib/config/application');
var prefix = App.prototype.namespace('modal');
var _ = require('lodash');
var Layout = require('./layout.js');
var bb = require('backbone');
var mn = require('backbone.marionette');
var globalChannel = require('backbone.radio').channel('global');
var JSON = window.JSON;

// css classes
Modal.baseClassNames = {
  vex     : prefix,
  content : prefix + '-content',
  overlay : prefix + '-overlay',
  close   : prefix + '-close',
  closing : prefix + '-closing',
  open    : prefix + '-open'
};

/* jshint  -W071, -W074 */
var parseXHR = function(xhr, statusText, thrownError) {
  thrownError = thrownError || {};
  var options = { header: {} };

  // header
  if( _.isString(thrownError) ){
    options.header.title = thrownError;
  } else {
    options.header.title = (thrownError.title || statusText);
  }

  // message
  options.message = thrownError.message || _.get(
      xhr,
      ['responseJSON', 'errors', 0, 'message'],
      JSON.stringify(xhr.responseText)
    );

  // raw output
  if (options.message !== xhr.responseText) {
    options.raw = xhr.responseText;
  }

  return options;
};
/* jshint +W071, +W074 */

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

  /* jshint  -W074 */
  parseOptions: function( options ) {

    // simple message
    if ( _.isString(options) ) {
      options = {message: options};
    }

    // backbone view
    else if (options instanceof bb.View) {
      options = {view: options};
    }

    // errors thrown by idb-wrapper
    else if (options instanceof Error) {
      options = {
        header: {
          title: 'IDBError'
        },
        message: options.message
      };
    }

    // other objects
    else if ( _.isObject(options) ) {
      options = this._parseObject(options);
    }

    return options;
  },
  /* jshint  +W074 */

  _parseObject: function(options){
    var err = _.get(options, ['target', 'error']);

    // errors thrown by indexedDB
    if (err instanceof window.DOMError) {
      options = {
        header: {
          title: err.title
        },
        message: err.message
      };
    }

    // backbone sync error
    else if (options.xhr) {
      options = parseXHR(
        options.xhr, options.statusText, options.thrownError
      );
    }

    // raw jqXHR
    else if (options.readyState) {
      options = parseXHR(options);
    }

    return options;
  }

});