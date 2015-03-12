define(['app', 'indexeddb'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.DB = {
			id: 'customersDB',
			description: 'POS customers database',
			nolog: true,
			migrations : [
				{
					version: '3',
					// before: function(next) {
					// 	next();
					// },
					migrate: function(transaction, next) {

						var store;
						if( !transaction.db.objectStoreNames.contains( 'customers' ) ){
							store = transaction.db.createObjectStore( 'customers', { keyPath: 'id' } );
						}
						next();
					}
				}
			]
		};

	});

});