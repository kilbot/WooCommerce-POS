var POS = (function(App, Backbone, Marionette, $, _) {

    App.Components.Modal = {};

    /**
     * API
     */
    App.Components.Modal.channel = Backbone.Radio.channel('modal');

    /**
     * Controller
     */
    App.Components.Modal.Controller = Marionette.Controller.extend({

        initialize: function (options) {
            this.container = options.container;
            this.view = new App.Components.Modal.View();
            this.container.show(this.view);

            _.bindAll(this, 'openModal', 'closeModal');
            App.Components.Modal.channel.comply('open', this.openModal);
            App.Components.Modal.channel.comply('close', this.closeModal);
        },

        openModal: function (options) {
            this.view.openModal(options);
        },

        closeModal: function (options) {
            this.view.closeModal(options);
        }

    });

    return App;

})(POS || {}, Backbone, Marionette, jQuery, _);