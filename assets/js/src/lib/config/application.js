var Mn = require('backbone.marionette');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var hbs = require('handlebars');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var debugFunction = require('debug');
var bb = require('backbone');
var accounting = require('accounting');

module.exports = Mn.Application.extend({

  _initChannel: function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') ||
    Radio.channel(this.channelName);
  },

  _initDebug: function( debug ){
    if( debug ){
      debugFunction.enable('*');
    }
    Radio.DEBUG = debug;
    console.info(
      'Debugging is ' +
      ( debug ? 'on' : 'off' )  +
      ', visit http://woopos.com.au/docs/debugging'
    );
  },

  _initOptions: function( params ){
    params = params || {};
    accounting.settings = params.accounting;
    bb.emulateHTTP = params.emulateHTTP || false;
    hbs.Templates = params.templates || {};
    polyglot.extend( params.i18n );
    this._initDebug( params.debug );
  },

  /**
   * @param options
   */
  start: function( options ){
    var self = this;
    $.getJSON(
      options.ajaxurl, {
        action: options.action || 'wc_pos_params',
        security: options.nonce
      }, function( params ){
        self._initOptions( params );
        Mn.Application.prototype.start.call(self, params);
      }
    ).fail(function(xhr, statusText, thrownError){
      Radio.request('modal', 'error', {
        xhr: xhr,
        statusText: statusText,
        thrownError: thrownError
      });
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
 * Custom Template Access
 **/
Mn.TemplateCache.prototype.loadTemplate = function(templateId){
  return _.get( hbs.Templates, templateId.split('.'), $(templateId).html() );
};

Mn.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  try {
    return hbs.compile(rawTemplate);
  } catch(e) {
    Radio.request('modal', 'error', e);
    throw e;
  }
};