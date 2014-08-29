define(['app', 'handlebars', 'backbone.syphon'], function(POS, Handlebars){

	POS.module('CartApp.Checkout.View', function(View, POS, Backbone, Marionette, $, _){

		View.Payment = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-checkout').html() ),

			behaviors: {
				Numpad: {}
			},

			triggers: {
				'click .action-close' 	: 'checkout:close'
			},

			events: {
				'click .action-process' 	: 'processPayment',
				'click @ui.gateways legend' : 'selectGateway'
			},

			ui: {
				status: '#checkout-status',
				gateways: '#checkout-gateways',
				actions: '#checkout-actions',
			},

			onRender: function(){
				// hide all except default
				this.$('#checkout-gateways fieldset').each( function() {
					if( !$(this).hasClass('active') ) {
						$(this).children('.form-group').hide();
					}
				});

				// listen to cash and card fields
				this.ui.gateways.find('*[data-numpad]').on( 'keypress', this.formatMoney );
			},

			processPayment: function() {
				this.processing(true);

				// process data
				var data = Backbone.Syphon.serialize( this );
				if( POS.debug ) console.log(data); 
				this.model.process( data );
			},

			processing: function( processing ) {
				if( processing ) {
					this.ui.actions.addClass('working').find('button').prop('disabled', true);
					// remove error messages
					this.ui.gateways.find('.alert-danger').remove();
				} else {
					this.ui.actions.removeClass('working').find('button').prop('disabled', false);
				}
			},

			selectGateway: function(e) {
				var selected = $(e.currentTarget).parent('fieldset'),
					active = this.ui.gateways.find('fieldset.active');

				if( !selected.hasClass('active') ) {
					active.removeClass('active').children('.form-group').slideUp('fast');
					selected.addClass('active').children('legend').children('input[type="radio"]').prop('checked', true);
					selected.children('.form-group').slideDown('fast');
				}
			},

			formatMoney: function(e) {
				if ( e.which === 13 ) { 
					// insert number in the right format
					var value = POS.unformat( $(e.target).val() );
					$(e.target).val( POS.formatNumber(value) );
				}
			},

			onErrorResponse: function( response ) {
				var error;

				// construct error message
				if( _.isArray(response.messages) ) {
					error = '<ul>';
					_.each(response.messages, function(message){
						error += '<li>' + message + '</li>';
					});
					error += '</ul>';
				} else {
					error = response.messages;
				}
				this.ui.gateways.find('fieldset.active .form-group').append( '<div class="alert-danger">' + error + '</div>' );
			}

		});

	});

	return POS.CartApp.Checkout.View;

});