var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
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

    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    $.getJSON( ajaxurl, {
      action: 'wc_pos_toggle_legacy_server',
      enable: $(e.target).data('action').split('-').pop() === 'enable',
      security: nonce
    }, function(){
      window.location.reload();
    });
  }

});

module.exports = EmulateHTTP;
POS.attach('Behaviors.EmulateHTTP', EmulateHTTP);