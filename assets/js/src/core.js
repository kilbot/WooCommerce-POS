//
// Backbone with Marionette & Radio shim
//
//var $ = require('jquery');
var _ = require('underscore');
var bb = require('backbone');
var $ = require('jquery');
bb.$ = $; // help bb find $ (for node mocha tests)
bb.Radio = require('backbone.radio');
var Marionette = require('backbone.marionette');
Marionette.Application.prototype._initChannel = function () {
  this.channelName = _.result(this, 'channelName') || 'global';
  this.channel = _.result(this, 'channel') ||
  bb.Radio.channel(this.channelName);
};

//
// Backbone plugins
//
require('backbone.stickit');
require('backbone.syphon/lib/backbone.syphon');
require('backbone-validation');
require('idb-wrapper');
require('backbone-idb/backbone-idb');
require('backbone-dualStorage/backbone.dualstorage');
bb.FilteredCollection =
  require('backbone-filtered-collection/backbone-filtered-collection');

//
// Bootstrap components
//
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/tooltip');
require('bootstrap-sass/assets/javascripts/bootstrap/popover');
require('bootstrap-sass/assets/javascripts/bootstrap/transition');
require('bootstrap-sass/assets/javascripts/bootstrap/dropdown');

//
// jQuery plugins
//
require('jquery.hotkeys/jquery.hotkeys');