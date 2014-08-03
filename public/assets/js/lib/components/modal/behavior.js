define(['app'], function(POS){
	
	POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _){
	
		Modal.Behavior = Marionette.Behavior.extend({

			initialize: function () {
				this.listenToOnce(this.view, 'modal:open',this.openModal);
			},

			openModal: function (callback) {
				Modal.channel.commands.execute('open', {
					view: this.view,
					callback: callback
				});

				this.listenToOnce(this.view, 'modal:close', this.closeModal);
			},

			closeModal: function (callback) {
				Modal.channel.commands.execute('close', {
					callback: callback
				});
			}

		});

	});

});

