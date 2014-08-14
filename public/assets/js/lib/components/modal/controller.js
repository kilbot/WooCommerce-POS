define(['app', 'lib/components/modal/view', 'lib/components/modal/behavior'], function(POS){

	POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _){

		/**
		 * API
		 */
		Modal.channel = Backbone.Radio.channel('modal');

		/**
		 * Controller
		 */
		Modal.Controller = Marionette.Controller.extend({

			initialize: function (options) {
				this.view = new Modal.View();
				POS.modalRegion.show(this.view);

				_.bindAll(this, 'openModal', 'closeModal');
				Modal.channel.comply('open', this.openModal);
				Modal.channel.comply('close', this.closeModal);
			},

			openModal: function (options) {
				this.view.openModal(options);
			},

			closeModal: function (options) {
				this.view.closeModal(options);
			},

		});

		// instantiate controller
		new Modal.Controller();

	});

});