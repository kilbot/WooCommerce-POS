var Mn = require('backbone.marionette');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var hbs = require('handlebars');
var Utils = require('lib/utilities/utils');

module.exports = POS.Application = Mn.Application.extend({

  _initChannel: function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') ||
    Radio.channel(this.channelName);
  },

  Utils: Utils,

  getPayload: function(){
    return $.getJSON(
      window.ajaxurl, {
        action: 'wc_pos_payload',
        security: window.nonce
      }
    );
  }

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