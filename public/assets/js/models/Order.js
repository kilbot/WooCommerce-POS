define(['backbone'], function(Backbone){

	var Order = Backbone.Model.extend({
		// initialize: function() { this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); }, // debug
	});
  
  // Return the model for the module
  return Order;
});