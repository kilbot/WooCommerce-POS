define(['app', 'indexeddb'], function(POS){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.DB = {
			id: 'productsDB',
			description: 'POS products database',
			// nolog: true,
			migrations : [
				{
					version: '1.0',
					before: function(db, next) {
						next();
					},
						migrate: function(db, versionRequest, next) {
						var store  = db.createObjectStore( 'products', { keyPath: 'id' } );
						store.createIndex( 'titleIndex', 'title', { unique: false } );
						next();
					}
				}, {
					version: '1.1',
					migrate: function(db, versionRequest, next) {
						var store = versionRequest.transaction.objectStore('products')
						store.createIndex( 'barcodeIndex', 'barcode', { unique: false } );
						store.createIndex( 'onSaleIndex', 'on_sale', { unique: false } );
						store.createIndex( 'categoriesIndex', 'categories', { unique: false } );
						store.createIndex( 'featuredIndex', 'featured', { unique: false } );
						store.createIndex( 'inStockIndex', 'in_stock', { unique: false } );
						store.createIndex( 'stockIndex', 'stock_quantity', { unique: false } );
						store.createIndex( 'skuIndex', 'sku', { unique: false } );
						store.createIndex( 'typeIndex', 'type', { unique: false } );
						next();
					}
				}
			]
		};

	});

});