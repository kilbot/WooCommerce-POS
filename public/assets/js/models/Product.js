define(['backbone'], function(Backbone){

	var database = {
		id: 'productsDB',
		description: 'POS products database',
		migrations : [{
			version: "1",
			migrate: function(transaction , next) {
				var store;
				if(!transaction.db.objectStoreNames.contains( 'products' )){
					store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
				}
				store = transaction.objectStore( 'products' );
				store.createIndex( 'titleIndex', 'title', { unique: false} );
				next();
			}
		}]
	};

	var Product = Backbone.Model.extend({
		database: database,
		storeName: 'products',

		// initialize: function() { this.on('all', function(e) { console.log(this.get('title') + " event: " + e); }); }, // debug
	});
  
  // Return the model for the module
  return Product;
});