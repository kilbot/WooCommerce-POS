POS.module('Components.HotKeys', function(HotKeys, POS, Backbone, Marionette, $, _) {

    HotKeys.Behavior = Marionette.Behavior.extend({

        initialize: function() {

            var hotkeys = POS.Entities.channel.request('hotkeys');
            _.each( this.view.keyEvents, function( method, id ) {
                var trigger = hotkeys.get(id);
                if( trigger ) {
                    $(document).bind('keydown', trigger.get('key'), this.view[method]);
                } else {
                    POS.debugLog( 'warn', 'Hotkey not found, id: ' + id );
                }
            }, this);

        },

        onClose: function() {
            _.each( this.view.keyEvents, function( method ) {
                $(document).unbind( 'keydown', this.view[method] );
            }, this);
        }

    });

});