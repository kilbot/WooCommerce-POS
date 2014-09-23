define(['app', 'indexeddb'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.DB = {
			id: 'productsDB',
			description: 'POS products database',
			nolog: true,
			migrations : [
				{
					version: '3',
					// before: function(next) {
					// 	next();
					// },
					migrate: function(transaction, next) {
						
						var store;
						if( !transaction.db.objectStoreNames.contains( 'products' ) ){
							store = transaction.db.createObjectStore( 'products', { keyPath: 'id' } );
						}
						next();
					}
				}
			]
		};

	});

});