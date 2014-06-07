define(['backbone', 'db/ProductsDB'], 
	function(Backbone, Database){

	var Product = Backbone.Model.extend({
		database: Database,
		storeName: 'products',

		// initialize: function() { this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); }, // debug
	});
  
  // Return the model for the module
  return Product;
});