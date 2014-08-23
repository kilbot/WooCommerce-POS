define(['app', 'handlebars', 'backbone.syphon'], function(POS, Handlebars){

	POS.module('CartApp.Checkout.View', function(View, POS, Backbone, Marionette, $, _){

		View.Payment = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout').html() ),

			behaviors: {
				Collapse: {},
				Numpad: {}
			},

			triggers: {
				'click .action-close' 	: 'checkout:close'
			},

			events: {
				'click .action-process' : 'processPayment'
			},

			ui: {
				status: '#checkout-status',
				gateways: '#checkout-gateways',
				actions: '#checkout-actions',
			},

			onRender: function(){
				this.$('.panel').on('show.bs.collapse', function(e){
					$(e.target).closest('.panel').removeClass('panel-default').addClass('panel-success');
				});
				this.$('.panel').on('hide.bs.collapse', function(e){
					$(e.target).closest('.panel').removeClass('panel-success').addClass('panel-default');
				});
			},

			processPayment: function() {
				this.processing(true);
				var data = Backbone.Syphon.serialize( this.ui.gateways.find('.panel-success')[0] );
				this.model.process( data );
			},

			processing: function( processing ) {
				if( processing ) {
					this.ui.actions.addClass('working').find('button').prop('disabled', true);
				} else {
					this.ui.actions.removeClass('working').find('button').prop('disabled', false);
					this.render();
				}
			}

		});

	});

	return POS.CartApp.Checkout.View;

});