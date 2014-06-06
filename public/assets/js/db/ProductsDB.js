define(['backbone', 'backbone-indexeddb'], 
	function (Backbone) {

	return {
		id: 'productsDB',
		description: 'POS products database',
		migrations : [{
			version: 1,
			migrate: function(transaction, next) {
				var store;
				if( !transaction.db.objectStoreNames.contains( 'products' ) ){
					store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
				}
				store.createIndex( 'titleIndex', 'title', { unique: false } );
				next();
			}
		}, {
			version: 2,
			migrate: function(transaction, next) {
				var store = undefined;
				if( !transaction.db.objectStoreNames.contains( 'products' ) ) {
					store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
				}
				store = transaction.objectStore( 'products' );
				store.createIndex( 'barcodeIndex', 'barcode', { unique: true } );
				next();
			} 
		}]
	};

});