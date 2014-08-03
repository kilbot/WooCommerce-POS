define([
	'app',
	'modal'
], function(
	POS
){
	
	POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _){
	
		Modal.View = Marionette.LayoutView.extend({
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
				if(POS.debug) console.log('[notice] Show modal');
				this.$el.modal('show');
			},

			closeModal: function (options) {
				this.once('after:hide:modal', options.callback);
				this.once('after:hide:modal', this.teardownModal);
				if(POS.debug) console.log('[notice] Close modal');
				this.$el.modal('hide');
			},

			setupModal: function (options) {
				if (this.isShown) this.teardownModal();
				this.content.show(options.view);
				this.isShown = true;
				if(POS.debug) console.log('[notice] Modal setup complete');
			},

			teardownModal: function () {
				if (!this.isShown) return;
				this.content.empty();
				this.isShown = false;
				if(POS.debug) console.log('[notice] Modal teardown complete');
			}
			
		});

		Modal.ModalView = Marionette.ItemView.extend({

			behaviors: {
				Modal: {
					behaviorClass: Modal.Behavior
				}
			},

			initialize: function (options) {
				this.template = _.template(options.data);
				this.trigger('modal:open' );
			},

			events: {
				'click .btn-primary' : 'confirm',
				'click .btn-default' : 'cancel',
				'click .close' 		 : 'cancel'
			},

			confirm: function () {
				this.trigger('modal:close');
			},

			cancel: function () {
				this.trigger('modal:close');
			}
		});

	});

});