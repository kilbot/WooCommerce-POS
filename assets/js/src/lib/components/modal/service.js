var Service = require('lib/config/service');
var Modal = require('vex-js');
var App = require('lib/config/application');
var prefix = App.prototype.namespace('modal');
var Layout = require('./layout');
var Radio = require('backbone.radio');
var _ = require('lodash');
var bb = require('backbone');
var ErrorView = require('./error/view');

// change Vex default options
_.extend( Modal.defaultOptions, {
  showCloseButton       : false,
  overlayClosesOnClick  : false
});

// change Vex default css classes
_.extend( Modal.baseClassNames, {
  vex     : prefix,
  content : prefix + '-content',
  overlay : prefix + '-overlay',
  close   : prefix + '-close',
  closing : prefix + '-closing',
  open    : prefix + '-open'
});

module.exports = Service.extend({
  channelName: 'modal',

  initialize: function(){

    /**
     * Modals can be requested directly
     */
    this.channel.reply({
      open    : this.open,
      close   : this.close,
      error   : this.error
    }, this);

    /**
     * or triggered on the global channel
     * - error on global channel could be used by another service, eg: Logger
     */
    Radio.channel('global').on({
      error   : this.error
    }, this);

  },

  /**
   * Open modal
   */
  /* jshint -W074 */
  open: function(options){
    options = options || {};

    if( _.isString(options) || options instanceof bb.View ){
      options = { view: options };
    }

    options.afterOpen = options.afterOpen || function( $el, opts ){
      opts.layout = new Layout({
        el      : $el,
        view    : options.view,
        prefix  : prefix
      });
      opts.layout.render();
    };

    return Modal.open( options );
  },
  /* jshint -W074 */

  close: function( id ){
    return Modal.close( id );
  },

  /**
   * error modal
   */
  error: function( error ){
    var view = new ErrorView({
      error: error
    });
    return this.open({
      view: view,
      className: prefix + '-error'
    });
  }

});