POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _) {

    Modal.View = Marionette.LayoutView.extend({
        template: '#tmpl-modal',
        className: 'modal',
        attributes: {
            'tabindex' : -1,
            'role' : 'dialog'
        },

        regions: {
            content: '.modal-body'
        },

        events: {
            'click .action-close'   : 'closeModal',
            'click .modal-footer a' : 'onButtonClick',
            'click .action-save'    : 'saving'
        },

        initialize: function () {
            this.$el.modal({ show: false });
        },

        onButtonClick: function(e) {
            e.preventDefault();
            this.content.currentView.trigger('button:clicked', e);
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
            if (this.isShown) {
                this.teardownModal();
            }

            // pass on attributes
            if( options.attributes ){

                // modal class
                if( options.attributes.class ){
                    this.$('.modal-dialog').addClass( options.attributes.class );
                }

                // modal title
                if( options.attributes.title ) {
                    this.$('.modal-header h1').html( options.attributes.title );
                }
            }

            this.content.show(options.view);
            this.isShown = true;
        },

        teardownModal: function () {
            if (!this.isShown) {
                return;
            }
            this.content.empty();
            this.render(); // re-render to reset attributes
            this.isShown = false;
        },

        saving: function(){
            this.$('.modal-footer .action-save').addClass( 'disabled' );
            this.$('.modal-footer p.response').html( '<i class="icon icon-spinner"></i>' );
        }

    });

});