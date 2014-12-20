POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _) {

    // init modal component on start
    POS.addInitializer(function() {
        new Modal.Controller({
            container: POS.layout.modalRegion
        });
    });

    // API
    Modal.channel = Backbone.Radio.channel('modal');

    // Controller
    Modal.Controller = Marionette.Controller.extend({

        initialize: function (options) {
            this.container = options.container;
            this.view = new Modal.View();
            this.container.show(this.view);

            _.bindAll(this, 'openModal', 'closeModal');
            Modal.channel.comply('open', this.openModal);
            Modal.channel.comply('close', this.closeModal);
        },

        openModal: function (options) {
            this.view.openModal(options);
        },

        closeModal: function (options) {
            this.view.closeModal(options);
        }

    });

});