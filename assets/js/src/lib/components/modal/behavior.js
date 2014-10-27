var POS = (function(App, $, Marionette) {

    App.Behaviors.Modal = Marionette.Behavior.extend({

        initialize: function () {
            this.listenToOnce(this.view, 'modal:open', this.openModal);
        },

        openModal: function (callback) {
            App.Components.Modal.channel.command('open', {
                view: this.view,
                callback: callback
            });

            this.listenToOnce(this.view, 'modal:close', this.closeModal);
        },

        closeModal: function (callback) {
            App.Components.Modal.channel.command('close', {
                callback: callback
            });
        }

    });

    return App;

})(POS || {}, jQuery, Marionette);