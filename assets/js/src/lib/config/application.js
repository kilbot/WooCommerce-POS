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

  _initOptions: function( payload ){
    payload = payload || {};

    // templates
    hbs.Templates = payload.templates || {};

    // polyglot
    polyglot.extend( payload.i18n );

    // options
    this.options = payload.params || {};

    // debug
    this._initDebug( this.options.debug );

    // emulateHTTP
    bb.emulateHTTP = this.options.emulateHTTP === true;

    // bootstrap accounting settings
    accounting.settings = this.options.accounting;
  },

  /**
   * todo: handle errors
   * @param options
   */
  start: function( options ){
    var self = this;
    $.getJSON(
      options.ajaxurl, {
        action: options.action || 'wc_pos_payload',
        security: options.nonce
      }, function( payload ){
        self._initOptions( payload );
        Mn.Application.prototype.start.call(self, payload);
      }
    );
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
  return hbs.compile(rawTemplate);
};