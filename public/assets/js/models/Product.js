define(['backbone', 'db/ProductsDB'], 
	function(Backbone, Database){

	var Product = Backbone.Model.extend({
		database: Database,
		storeName: 'products',

		addToCart: function(e) {
			if( typeof e !== 'undefined' ) e.preventDefault();

			console.log(this);

			// // if product already exists in cart, increase qty
			// if( _( this.cart.collection.pluck('id') ).contains( this.model.attributes.id ) ) {
			// 	this.cart.collection.get( this.model.attributes.id ).quantity('increase');
			// }

			// // else, add the product
			// else { 
			// 	this.cart.collection.create(this.model.attributes);
			// }
		},

		// initialize: function() { this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); }, // debug
	});
  
  // Return the model for the module
  return Product;
});