POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){

    Popover.Behavior = Marionette.Behavior.extend({

        initialize: function (options) {
            this.listenTo(this.view, 'popover:open', this.openPopover);
        },

        openPopover: function (target, callback) {
            Popover.channel.command('open', {
                target: target,
                callback: callback
            });

            this.listenTo(this.view, 'popover:close', this.closePopover);
        },

        closePopover: function (target, callback) {
            Popover.channel.command('close', {
                target: target,
                callback: callback
            });
        }

    });

});