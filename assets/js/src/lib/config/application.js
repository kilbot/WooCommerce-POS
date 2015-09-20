var Mn = require('backbone.marionette');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var hbs = require('handlebars');
var Utils = require('lib/utilities/utils');
var polyglot = require('lib/utilities/polyglot');
var debugFunction = require('debug');

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

  start: function( options ){
    var self = this;
    $.getJSON(
      options.ajaxurl, {
        action: 'wc_pos_payload',
        security: options.nonce
      }, function( payload ){
        var debug = _.get( payload, ['params', 'debug'], false );
        self._initDebug( debug );
        Mn.Application.prototype.start.call(self, payload);
      }
    );
  },

  set: function( path, value ){
    _.set( this, path, value );
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