var Mn = require('backbone.marionette');
var hbs = require('handlebars');
var Radio = require('backbone.radio');
var $ = require('jquery');
var _ = require('lodash');
var templates = {};

Mn.TemplateCache.prototype.loadTemplate = function(templateId){
  return _.get( templates, templateId.split('.'), $(templateId).html() );
};

Mn.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  try {
    return hbs.compile(rawTemplate);
  } catch(e) {
    Radio.request('modal', 'error', e);
    throw e;
  }
};

/**
 * Parse payload data and store templates
 *
 * @param data
 */
module.exports = function( data ){
  data = data || {};
  var settings = _.get(data, ['params', 'settings']),
      gateways = _.get(data, ['params', 'gateways']);

  // extend template var above
  _.extend( templates, data.templates );

  if( settings ){
    templates.settings = _.reduce( settings, function( result, setting ){
      result[setting.id] = setting.template;
      return result;
    }, {} );
  }

  if( gateways ){
    templates.settings = _.reduce( gateways, function( result, gateway ){
      result[gateway.id] = gateway.template;
      return result;
    }, {} );
  }
};