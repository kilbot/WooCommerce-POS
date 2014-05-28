define(['jquery', 'underscore', 'backbone', 'accounting'], 
	function($, _, Backbone, accounting) {

	accounting.settings = pos_params.accounting.settings;

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