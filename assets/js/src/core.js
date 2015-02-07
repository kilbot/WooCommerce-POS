/**
 * Core =
 * Marionette & Radio shim
 */
var $ = require('jquery');
var _ = require('underscore');
var bb = require('backbone');
bb.$ = $; // help bb find $ (for node mocha tests)
bb.Radio = require('backbone.radio');
var Marionette = require('backbone.marionette');
Marionette.Application.prototype._initChannel = function () {
  this.channelName = _.result(this, 'channelName') || 'global';
  this.channel = _.result(this, 'channel') ||
  bb.Radio.channel(this.channelName);
};

/**
 * Bootstrap components
 */
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/tooltip');
require('bootstrap-sass/assets/javascripts/bootstrap/popover');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');
require('bootstrap-sass/assets/javascripts/bootstrap/dropdown');