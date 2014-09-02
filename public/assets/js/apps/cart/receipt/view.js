
define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CartApp.Receipt.View', function(View, POS, Backbone, Marionette, $, _){

		View.Receipt = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-receipt').html() ),

			ui: {
				status: '#receipt-status',
				message: '#receipt-message',
				actions: '#receipt-actions'
			},

			triggers: {
				'click .action-email' 	: 'email:receipt',
				'click .action-new-order': 'new:order'
			},

			events: {
				'click .action-print' 	: 'printReceipt',
				'click .action-refresh' : 'refreshReceipt'
			},

			onRender: function() {
				var redirect;
				if( redirect = this.ui.message.find('*[data-redirect]').attr('href') ) {
					window.open(redirect, '_blank');
				}
			},

			serializeData: function() {
				var data = this.model.toJSON();

				// itemized tax
				if( pos_params.wc.tax_total_display === 'itemized' ) {
					data.show_itemized = true;
				}

				// prices include tax?
				if( pos_params.wc.tax_display_cart === 'incl' ) {
					data.subtotal = parseFloat( data.subtotal ) + parseFloat( data.subtotal_tax );
					data.cart_discount = data.subtotal - data.total;

					_.each( data.line_items, function(item, key) {
						item.subtotal = parseFloat( item.subtotal ) + parseFloat( item.subtotal_tax );
						item.total = parseFloat( item.total ) + parseFloat( item.total_tax );
					});

					data.incl_tax = true;
				}

				if( data.payment_details.message ) {
					data.show_message = true;
				}

				this.data = data;
				return data;
			},

			refreshReceipt: function() {
				var self = this;
				this.ui.actions.addClass('working').find('button').prop('disabled', true);
				$.when( this.model.fetch({ data: {pos: 1} }) ).done( function() {
					self.ui.actions.removeClass('working').find('button').prop('disabled', false);
					self.render();
				});
			},

			printReceipt: function() {
				if(POS.debug) console.log('fetching receipt template');

				var self = this;
				$.when( this.fetchTemplate() )
				.done( function( receiptTmpl ) {
					var template = Handlebars.compile( receiptTmpl );
					var html = template( self.data );
					POS.Components.Print.channel.command('print', html);
				})
				.fail( function() {
					if(POS.debug) console.warn('problem receipt template');
				});				
			},

			fetchTemplate: function() {
				return $.get( 
					pos_params.ajax_url , { 
						action: 'pos_get_print_template', 
						template: 'receipt',
						security: pos_params.nonce 
					} 
				);
			},

		});

		View.EmailModal = Marionette.ItemView.extend({
			initialize: function (options) {
				var self = this;

				if(POS.debug) console.log('fetching modal email receipt template');

				$.when( this.fetchTemplate() )
				.done( function( data ) {
					self.template = _.template(data);
					self.trigger('modal:open');
				})
				.fail( function() {
					if(POS.debug) console.warn('problem fetching email receipt template');
				});
			},

			render: function(options) {
				options || ( options = {} );
				_.defaults( options, {
					result: false,
					message: ''
				});
				this.$el.html( this.template(options) );
				return this;
			},

			behaviors: {
				Modal: {}
			},

			triggers: {
				'click .action-send': 'send:email',
			},

			events: {
				'click .close' 		 : 'cancel',
				'click .action-close': 'cancel'
			},

			cancel: function () {
				this.trigger('modal:close');
			},

			fetchTemplate: function() {
				return $.get( 
					pos_params.ajax_url , { 
						action: 'pos_get_modal', 
						template: 'email-receipt',
						security: pos_params.nonce
						// don't send pos flag with this
					} 
				);
			},

		});

	});

	return POS.CartApp.Receipt.View;

});