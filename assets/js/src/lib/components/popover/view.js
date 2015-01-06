POS.module('Components.Popover', function(Popover, POS, Backbone, Marionette, $, _){

    Popover.View = Marionette.LayoutView.extend({
        template: _.template('<div class="arrow"></div><div class="popover-region"><h3 class="popover-title"></h3><div class="popover-content"></div></div>'),
        className: 'popover',
        attributes: {
            'role' : 'tooltip'
        },

        regions: {
            content : '.popover-region'
        },

        initialize: function (options) {
            this.render();

            var self = this;
            options.target.on( 'show.bs.popover', function(e) {
                self.trigger('after:show:popover', self);
            });
            options.target.on( 'hide.bs.popover', function(e) {
                self.trigger('after:hide:popover', self);
            });

            // kill switch
            options.target.on( 'close:popover', function(e) {
                self.closePopover({ target: $(e.target) });
            });
        },

        openPopover: function (options) {
            this.once( 'after:show:popover', options.callback );
            this.setupPopover(options);
            options.target.popover('show');
        },

        closePopover: function (options) {
            this.once('after:hide:popover', options.callback );
            this.once('after:hide:popover', this.teardownPopover );
            options.target.popover('destroy');
        },

        setupPopover: function (options) {
            var opts = _.clone(options) || {};
            _.defaults(opts, {
                html: true,
                container: 'body',
                placement: 'bottom',
                trigger: 'manual',
                template: this.el
            });

            // setup
            options.target.popover(opts);
        },

        teardownPopover: function () {
            if(this.content) {
                this.content.empty();
            }
            this.destroy();
        }

    });

});