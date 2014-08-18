define(['app', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Totals = Backbone.Model.extend({
			defaults: {
				note			: '',
				order_discount 	: 0,
				customer_id 	: pos_params.customer.default_id,
				customer_name	: pos_params.customer.default_name
			},

			initialize: function(options) {
				// this.on('all', function(e) { console.log("Cart Totals Model event: " + e); }); // debug
				
				// localStorage
				this.localStorage = new Backbone.LocalStorage( 'cart_totals' );

				// update total and save on change
				this.on( 'change', this.updateTotal, this ); 

			},

			updateTotal: function() {
				var total;
				if( pos_params.wc.prices_include_tax === 'yes' ) {
					total = this.get('subtotal') - this.get('order_discount');
				} else {
					total = this.get('subtotal') + this.get('tax') - this.get('order_discount');
				}			
				
				this.set({ total: total }, { silent: true });
				this.save();
			},

			processPayment: function( gateway_data ) {

				// combine total model with checkout form data
				var order = _.assign( this.toJSON(), gateway_data);

				// add ajax info
				var data = _.assign( order, {
					action 	: 'pos_process_order',
					security: pos_params.nonce
				});

				// send the cart data to the server
				$.post( pos_params.ajax_url, data )
				.done(function( data ) {
					console.log(data);
				})
				.fail(function( jqXHR, textStatus, errorThrown ) {
					if(POS.debug) console.warn('error processing payment');
				});
			}

		});

	});

	return;
});