define(['app', 'localstorage'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Totals = Backbone.Model.extend({
			defaults: {
				title 			: 'Cart Totals',
				note			: '',
				order_discount 	: 0,
				customer_id 	: pos_params.customer.default_id,
				customer_name	: pos_params.customer.default_name
			},

			initialize: function(options) {
				this.on('all', function(e) { console.log("Cart Totals Model event: " + e); }); // debug
				
				// localStorage
				this.localStorage = new Backbone.LocalStorage( 'cart_totals' );

				this.on( 'change', this.updateTotal, this ); 

			},

			updateTotal: function() {				
				var total = this.get('subtotal') - this.get('cart_discount') + this.get('tax') - this.get('order_discount');
				this.set({ total: total }, { silent: true });
				this.save();

				// // get order discount
				// order_discount = this.get('order_discount');

				// // totals calc
				// subtotal = line_totals + cart_discount;
				// total = line_totals + tax - order_discount;

				// special case: display cart with tax
				// if ( this.params.wc.tax_display_cart === 'incl' ) {
				// 	subtotal += tax;
				// }

			},

		});

	});

	return;
});