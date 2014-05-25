define(['backbone', 'accounting'], function(Backbone, accounting) {

	// pos_cart_params is required to continue, ensure the object exists
	if ( typeof pos_cart_params === 'undefined' ) {
		console.log('No pos_cart_params');
		return false;
	} else {
		accounting.settings = pos_cart_params.accounting.settings;
		var wc = pos_cart_params.wc;
	}

	// the view contining a single total
	var CartTotal = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-cart-total').html()),

		initialize: function() {

		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();

			// make cart discounts display as negative
			if( item.label === 'Cart Discount:') {
				item.total *= -1; 
			}

			// format total for currency
			item.total = accounting.formatMoney( item.total );

			// // add 'ex. tax' if necessary
			// if( item.label === 'Subtotal:' && wc.tax_display_cart === 'excl') {
			// 	item.total = item.total + ' <small>(ex. tax)</small>';
			// }

			// render the single total
			this.$el.html( ( this.template( item ) ) );

			return this;
		},
		
	});	

  return CartTotal;
});