var Mn = require('backbone.marionette');
var Radio = require('backbone.radio');
var _ = require('lodash');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var debugFunction = require('debug');
var bb = require('backbone');
var accounting = require('accounting');
var ajax = require('./ajax');
var templateCache = require('./template-cache');

var initDebug = function( debug ){
  if( debug ){
    debugFunction.enable('*');
  }
  Radio.DEBUG = debug;
  console.info(
    'Debugging is ' +
    ( debug ? 'on' : 'off' )  +
    ', visit http://woopos.com.au/docs/debugging'
  );
};

var Application = Mn.Application.extend({

  _initChannel: function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') ||
    Radio.channel(this.channelName);
  },

  /**
   * @param options
   *
   * force wc_api to have trailing slash
   */
  start: function( options ){
    options = options || {};
    var params, self = this, wc_api = options.wc_api.replace(/\/?$/, '/');

    // get payload
    this.getJSON( wc_api + 'pos/' )

    // set up data
    .then(function(data){
      data = data || {};
      params = _.extend({ wc_api: wc_api }, data.params );
      accounting.settings = params.accounting;
      bb.emulateHTTP = params.emulateHTTP || false;
      initDebug( params.debug );
      templateCache( data );
      polyglot.extend(data.i18n);
    })

    // start the app
    .then(function(){
      Mn.Application.prototype.start.call(self, params);
    });
  },

  set: function( path, value ){
    _.set( this, path, value );
  },

  // namespace prefix for WP Admin
  namespace: function( str ){
    var prefix = window.adminpage ? 'wc_pos-' : '' ;
    return prefix + str;
  },

  // extend app for third party plugins
  debug: debugFunction,
  polyglot: polyglot,
  Utils: Utils

});

/**
 * Extend Application prototype
 */
_.extend( Application.prototype, ajax );

module.exports = Application;