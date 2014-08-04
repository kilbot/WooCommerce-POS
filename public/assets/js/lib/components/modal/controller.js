define([
	'app', 
	'lib/components/modal/view',
	'lib/components/modal/behavior'
], function(
	POS
){

	POS.module('Components.Modal', function(Modal, POS, Backbone, Marionette, $, _){

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
			},

			getModal: function(template, data) {
				if(POS.debug) console.log('[notice] Fetching modal template: ' + template);
				$.get( pos_params.ajax_url , { action: 'pos_get_modal', template: template, data: data, security: pos_params.nonce } )
				.done(function( data ) {
					new Modal.ModalView({ data: data });
				})
				.fail(function() {
					if(POS.debug) console.log('[error] Problem fetching modal template');
				});
			} 

		});

	});

});