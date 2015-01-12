POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){

    /**
     * API
     */
    Popover.channel = Backbone.Radio.channel('popover');

    /**
     * Controller
     */
    Popover.Controller = Marionette.Controller.extend({
        initialize: function (options) {
            _.bindAll(this, 'openPopover', 'closePopover');
            Popover.channel.comply('open', this.openPopover);
            Popover.channel.comply('close', this.closePopover);
        },

        openPopover: function (options) {
            this.view = new Popover.View(options);
            this.view.openPopover(options);
        },

        closePopover: function (options) {
            this.view.closePopover(options);

        },

    });

    new Popover.Controller();

});
