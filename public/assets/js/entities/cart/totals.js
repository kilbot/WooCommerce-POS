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

		});

	});

	return;
});