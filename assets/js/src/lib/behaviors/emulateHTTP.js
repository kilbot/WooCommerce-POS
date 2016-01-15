var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var $ = require('jquery');
var Radio = require('backbone.radio');

/**
 * Toggles legacy server support
 */
var EmulateHTTP = Behavior.extend({

  ui: {
    toggle : '*[data-action^="legacy-"]'
  },

  events: {
    'click @ui.toggle' : 'toggle'
  },

  toggle: function(e) {
    e.preventDefault();

    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    $.getJSON( window.ajaxurl, {
      action: 'wc_pos_toggle_legacy_server',
      enable: $(e.target).data('action').split('-').pop() === 'enable',
      security: nonce
    }, function(){
      window.location.reload();
    })
    .fail( function( xhr, statusText, thrownError ) {
      Radio.request( 'modal', 'error', {
        xhr: xhr,
        statusText: statusText,
        thrownError: thrownError
      } );
    });
  }

});

module.exports = EmulateHTTP;
App.prototype.set('Behaviors.EmulateHTTP', EmulateHTTP);