var Behavior = require('lib/config/behavior');
var bb = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var entitiesChannel = bb.Radio.channel('entities');
var debugLog = require('lib/utilities/debug');
var POS = require('lib/utilities/global');

module.exports = POS.Behaviors.HotKeys = Behavior.extend({

  initialize: function() {

    var hotkeys = entitiesChannel.request( 'get:settings', 'hotkeys' );
    _.each( this.view.keyEvents, function( method, id ) {
      var trigger = hotkeys.get(id);
      if( trigger ) {
        $(document).bind('keydown', trigger.get('key'), this.view[method]);
      } else {
        debugLog( 'warn', 'Hotkey not found, id: ' + id );
      }
    }, this);

  },

  onClose: function() {
    _.each( this.view.keyEvents, function( method ) {
      $(document).unbind( 'keydown', this.view[method] );
    }, this);
  }

});