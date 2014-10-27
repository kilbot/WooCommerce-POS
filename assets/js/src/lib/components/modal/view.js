var POS = (function(App, $, Marionette) {

    App.Components.Modal.View = Marionette.LayoutView.extend({
        template: _.template('<div class="modal-dialog"><div class="modal-content"></div></div>'),
        className: 'modal fade',
        attributes: {
            'tabindex' : -1,
            'role' : 'dialog'
        },

        regions: {
            content: '.modal-content'
        },

        initialize: function (options) {
            this.$el.modal({ show: false });
        },

        triggers: {
            'show.bs.modal'   : { preventDefault: false, event: 'show:modal' },
            'shown.bs.modal'  : { preventDefault: false, event: 'after:show:modal' },
            'hide.bs.modal'   : { preventDefault: false, event: 'hide:modal' },
            'hidden.bs.modal' : { preventDefault: false, event: 'after:hide:modal' }
        },

        openModal: function (options) {
            this.once('after:show:modal', options.callback);
            this.setupModal(options);
            this.$el.modal('show');
        },

        closeModal: function (options) {
            this.once('after:hide:modal', options.callback);
            this.once('after:hide:modal', this.teardownModal);
            this.$el.modal('hide');
        },

        setupModal: function (options) {
            if (this.isShown) this.teardownModal();
            this.content.show(options.view);
            this.isShown = true;
        },

        teardownModal: function () {
            if (!this.isShown) return;
            this.content.empty();
            this.isShown = false;
        }

    });

    return App;

})(POS || {}, jQuery, Marionette);