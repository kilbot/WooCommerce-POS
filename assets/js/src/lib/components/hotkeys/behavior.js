var Behavior = require('lib/config/behavior');
var bb = require('backbone');
var $ = require('jquery');
var _ = require('lodash');
var entitiesChannel = bb.Radio.channel('entities');
var debug = require('debug')('hotkey');
var POS = require('lib/utilities/global');

var HotKeys = Behavior.extend({

  initialize: function() {

    var hotkeys = entitiesChannel.request( 'get', {
      type: 'settings',
      name: 'hotkeys'
    });
    _.each( this.view.keyEvents, function( method, id ) {
      var trigger = hotkeys.get(id);
      if( trigger ) {
        $(document).bind('keydown', trigger.get('key'), this.view[method]);
      } else {
        debug('not found, id: ' + id );
      }
    }, this);

  },

  onClose: function() {
    _.each( this.view.keyEvents, function( method ) {
      $(document).unbind( 'keydown', this.view[method] );
    }, this);
  }

});

module.exports = HotKeys;
POS.attach('Behaviors.HotKeys', HotKeys);