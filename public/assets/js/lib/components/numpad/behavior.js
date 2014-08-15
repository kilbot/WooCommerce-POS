define(['app'], function(POS){
	
	POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){
	
		/**
		 * Popover behavior
		 */
		Numpad.Behavior = Marionette.Behavior.extend({



			// initialize: function () {
			// 	this.listenToOnce(this.view, 'modal:open', this.openModal);
			// },

			// openModal: function (callback) {
			// 	Modal.channel.command('open', {
			// 		view: this.view,
			// 		callback: callback
			// 	});

			// 	this.listenToOnce(this.view, 'modal:close', this.closeModal);
			// },

			// closeModal: function (callback) {
			// 	Modal.channel.command('close', {
			// 		callback: callback
			// 	});
			// }

		});

	});

});