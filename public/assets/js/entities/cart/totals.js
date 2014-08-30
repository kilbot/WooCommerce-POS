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
				var total = this.get('subtotal');
				total -= this.get('cart_discount');
				total += this.get('total_tax');
				total -= this.get('order_discount');
				
				// this.set(); // don't trigger change
				this.save({ total: POS.round( total, 4 ) }, { silent: true });
			},

		});

	});

	return;
});