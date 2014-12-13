POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _) {

    Modal.Behavior = Marionette.Behavior.extend({

        initialize: function (options) {
            this.listenToOnce(this.view, 'modal:open', this.openModal);
        },

        openModal: function (callback) {
            if( this.view.title ){
                this.options.title = this.view.title;
            }

            Modal.channel.command('open', {
                view: this.view,
                callback: callback,
                attributes: this.options
            });

            this.listenToOnce(this.view, 'modal:close', this.closeModal);
        },

        closeModal: function (callback) {
            Modal.channel.command('close', {
                callback: callback
            });
        }

    });

});