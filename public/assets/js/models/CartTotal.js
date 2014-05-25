define(['backbone'], function(Backbone){

	var CartTotal = Backbone.Model.extend({
		defaults: {
			label: '',
			total: 0.00
		},
		idAttribute: 'label',

		initialize: function() { 
			// this.on('all', function(e) { console.log(this.get('label') + " event: " + e); }); // debug
		},
	});
  
	// Return the model for the module
	return CartTotal;
});