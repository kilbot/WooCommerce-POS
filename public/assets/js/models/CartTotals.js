define(['backbone', 'backbone-localstorage'], 
	function(Backbone, LocalStorage){

	var CartTotal = Backbone.Model.extend({
		localStorage: new Backbone.LocalStorage('cart_totals'),
		defaults: {
			title 			: 'Cart Totals',
			note			: '',
			order_discount 	: 0,
			customer_id 	: pos_params.customer.default_id,
			customer_name	: pos_params.customer.default_name
		},

		initialize: function() { 
			this.on('all', function(e) { console.log("Cart Totals Model event: " + e); }); // debug
		},
	});
  
	// Return the model for the module
	return CartTotal;
});