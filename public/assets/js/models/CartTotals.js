define(['backbone'], 
	function(Backbone){

	var CartTotal = Backbone.Model.extend({
		defaults: {
			title : 'Cart Totals'
		},

		initialize: function() { 
			this.on('all', function(e) { console.log("Cart Totals Model event: " + e); }); // debug
		},
	});
  
	// Return the model for the module
	return CartTotal;
});